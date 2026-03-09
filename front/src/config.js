import axios from 'axios';
import Swal from 'sweetalert2';

export const URI = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Instancia global de Axios con wake-up automático para Render (tier gratuito)
// ---------------------------------------------------------------------------

const api = axios.create({ baseURL: URI });

let isWakingUp = false;
let wakeUpTimer = null;

function showWakeUpBanner() {
    if (isWakingUp) return;
    isWakingUp = true;
    
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

function hideWakeUpBanner() {
    if (isWakingUp) {
        Swal.close();
        isWakingUp = false;
    }
}

// Interceptor de PETICIÓN: Detecta si la respuesta tarda mucho
api.interceptors.request.use(config => {
    // Si ya estamos en proceso de despertar, no hacemos nada nuevo
    if (isWakingUp) return config;

    // Ponemos un temporizador: si en 3 segundos no hay respuesta, mostramos el cartel
    // Esto es proactivo: avisa ANTES de que la petición falle por timeout
    wakeUpTimer = setTimeout(() => {
        showWakeUpBanner();
    }, 3000); 

    return config;
}, error => Promise.reject(error));

// Interceptor de RESPUESTA: Limpia el temporizador y cierra el cartel
api.interceptors.response.use(
    response => {
        // Si la respuesta llega rápido, cancelamos el aviso
        clearTimeout(wakeUpTimer);
        hideWakeUpBanner();
        return response;
    },
    async error => {
        clearTimeout(wakeUpTimer);
        const originalRequest = error.config;

        // Si es un error de red o timeout
        const isNetworkError = !error.response || error.code === 'ECONNABORTED';
        
        if (isNetworkError && !originalRequest._wakeRetry) {
            originalRequest._wakeRetry = true;
            showWakeUpBanner();

            // Reintentar hasta que el servidor responda
            const start = Date.now();
            const timeoutMs = 90000;
            
            while (Date.now() - start < timeoutMs) {
                try {
                    await axios.get(URI, { timeout: 5000 });
                    hideWakeUpBanner();
                    return api(originalRequest); // Reintentar la original
                } catch (e) {
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
            
            hideWakeUpBanner();
            Swal.fire('Error', 'El servidor no pudo despertar a tiempo.', 'error');
        }

        return Promise.reject(error);
    }
);

export default api;
