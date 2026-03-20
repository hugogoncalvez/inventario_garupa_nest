import axios from 'axios';
import Swal from 'sweetalert2';

export const URI = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: URI });

let isBannerVisible = false;
let wakeUpTimer = null;
let activeRequests = 0;

/**
 * Detecta si el tema actual es oscuro
 */
export function isDarkMode() {
    return document.documentElement.getAttribute('data-mode') === 'dark' ||
           document.documentElement.getAttribute('data-theme') === 'dark' ||
           window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Obtiene los colores según el tema actual
 */
export function getThemeColors() {
    if (isDarkMode()) {
        return {
            background: '#1e293b',
            color: '#f8fafc',
            backdrop: 'rgba(0, 0, 0, 0.6)',
            iconColor: '#60a5fa'
        };
    }
    return {
        background: '#ffffff',
        color: '#0f172a',
        backdrop: 'rgba(37, 99, 235, 0.3)',
        iconColor: '#2563eb'
    };
}

function showWakeUpBanner() {
    if (isBannerVisible) return;
    isBannerVisible = true;

    const colors = getThemeColors();

    Swal.fire({
        title: 'Despertando servidor...',
        html: `
            <div style="text-align: center; padding: 8px;">
                <p style="margin: 0; color: ${colors.color}; opacity: 0.8;">
                    El servidor gratuito está inactivo
                </p>
                <p style="margin: 8px 0 0 0; font-weight: 600;">
                    Reconectando... (30-60 seg)
                </p>
            </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: colors.background,
        color: colors.color,
        backdrop: colors.backdrop,
        customClass: {
            popup: isDarkMode() ? 'swal2-dark' : ''
        }
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
            const colors = getThemeColors();
            Swal.fire({
                title: 'Error de conexión',
                text: 'El servidor no pudo despertar. Intenta recargar la página.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                background: colors.background,
                color: colors.color,
                confirmButtonColor: isDarkMode() ? '#60a5fa' : '#2563eb'
            });
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

    const interval = setInterval(() => {
        console.log("💓 Ping preventivo al backend...");
        axios.get(URI).catch(() => null);
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
};

/**
 * Mantiene vivo el Bot de WhatsApp cada 10 minutos
 */
export const startBotHeartbeat = () => {
    const BOT_URL = 'https://inventario-whatsapp-bot.onrender.com/health';
    const HEARTBEAT_INTERVAL = 10 * 60 * 1000;

    console.log("🤖 Heartbeat del Bot iniciado: se mantendrá vivo en Render.");

    // Primer ping inmediato
    fetch(BOT_URL).catch(() => null);

    const interval = setInterval(() => {
        console.log("🤖 Ping preventivo al Bot de WhatsApp...");
        fetch(BOT_URL)
            .then(res => res.json())
            .then(data => console.log("🤖 Estado del Bot:", data.status))
            .catch(() => console.warn("⚠️ Despertando al bot de WhatsApp..."));
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
};

export default api;
