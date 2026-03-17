import axios from 'axios';
import Swal from 'sweetalert2';

export const URI = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: URI });

let isBannerVisible = false;
let wakeUpTimer = null;
let activeRequests = 0;

function showWakeUpBanner() {
    if (isBannerVisible) return;
    isBannerVisible = true;
    
    Swal.fire({
        title: 'Despertando el servidor...',
        html: 'La instancia gratuita de Render se "duerme" por inactividad.<br><b>Estamos reconectando (puede tardar 30-60 seg).</b>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: '#fff',
        color: '#1976d2',
        backdrop: 'rgba(25, 118, 210, 0.4)'
    });
}

function closeBanner() {
    if (isBannerVisible) {
        Swal.close();
        isBannerVisible = false;
    }
    if (wakeUpTimer) {
        clearTimeout(wakeUpTimer);
        wakeUpTimer = null;
    }
}

// Interceptor de PETICIÓN
api.interceptors.request.use(config => {
    activeRequests++;
    // Si es el primer request y no es un reintento, ponemos el timer
    if (activeRequests === 1 && !config._wakeRetry) {
        wakeUpTimer = setTimeout(() => {
            showWakeUpBanner();
        }, 4000); // 4 segundos de espera antes de avisar
    }
    return config;
}, error => {
    activeRequests--;
    if (activeRequests === 0) closeBanner();
    return Promise.reject(error);
});

// Interceptor de RESPUESTA
api.interceptors.response.use(
    response => {
        activeRequests--;
        if (activeRequests === 0) closeBanner();
        return response;
    },
    async error => {
        activeRequests--;
        const originalRequest = error.config;

        if (activeRequests === 0 && !originalRequest?._wakeRetry) {
             closeBanner();
        }

        // Caso A: Error 500 o similar (El servidor respondiò pero mal)
        if (error.response) {
            console.error('Error del servidor:', error.response.status);
            // Si es un 500, no es que esté dormido, es que algo falló
            return Promise.reject(error);
        }

        // Caso B: Error de Red o Timeout (Probablemente durmiendo)
        const isNetworkError = !error.response || error.code === 'ECONNABORTED';
        
        if (isNetworkError && !originalRequest._wakeRetry) {
            originalRequest._wakeRetry = true;
            showWakeUpBanner();

            const start = Date.now();
            const timeoutMs = 90000;
            
            while (Date.now() - start < timeoutMs) {
                try {
                    await axios.get(URI, { timeout: 5000 });
                    closeBanner();
                    return api(originalRequest); 
                } catch (e) {
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
            
            closeBanner();
            Swal.fire('Error', 'El servidor no pudo despertar.', 'error');
        }

        return Promise.reject(error);
    }
);

/**
 * Mantiene el servidor de Render despierto cada 10 minutos
 */
export const startHeartbeat = () => {
    // 10 minutos = 600,000 ms (Render duerme a los 15 min)
    const HEARTBEAT_INTERVAL = 10 * 60 * 1000;
    
    console.log("💓 Heartbeat iniciado: el servidor se mantendrá despierto.");
    
    // El primer ping es inmediato para asegurar la conexión
    axios.get(URI).catch(() => null);

    setInterval(() => {
        console.log("💓 Ping preventivo al backend...");
        axios.get(URI).catch(() => null);
    }, HEARTBEAT_INTERVAL);
};

export default api;
