import axios from 'axios';
import Swal from 'sweetalert2';

export const URI = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: URI });

let isBannerVisible = false;
let wakeUpTimer = null;
let activeRequests = 0;

/**
 * Detecta si el tema actual es oscuro (MUI v7 usa data-mui-color-scheme)
 */
export function isDarkMode() {
    return document.documentElement.getAttribute('data-mui-color-scheme') === 'dark' ||
           window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Obtiene los colores según el tema actual para SweetAlert2
 */
export function getThemeColors() {
    const isDark = isDarkMode();
    return {
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        backdrop: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(37, 99, 235, 0.2)',
        confirmButtonColor: isDark ? '#60a5fa' : '#2563eb',
        cancelButtonColor: isDark ? '#475569' : '#64748b',
    };
}

/**
 * Instancia de SweetAlert2 que hereda el tema actual automáticamente
 */
export const MySwal = () => {
    const colors = getThemeColors();
    return Swal.mixin({
        background: colors.background,
        color: colors.color,
        backdrop: colors.backdrop,
        confirmButtonColor: colors.confirmButtonColor,
        cancelButtonColor: colors.cancelButtonColor,
        customClass: {
            popup: 'rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700',
            confirmButton: 'px-6 py-2 font-bold rounded-lg',
            cancelButton: 'px-6 py-2 font-bold rounded-lg',
        }
    });
};

/**
 * Muestra un aviso de carga no cancelable
 */
export const showLoading = (message = 'Procesando...') => {
    return MySwal().fire({
        title: message,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

/**
 * Muestra un mensaje de éxito que desaparece solo
 */
export const showSuccess = (title, message = '') => {
    return MySwal().fire({
        icon: 'success',
        title,
        text: message,
        timer: 2000,
        showConfirmButton: false
    });
};

/**
 * Muestra un mensaje de error
 */
export const showError = (title, message = 'Ocurrió un error inesperado.') => {
    return MySwal().fire({
        icon: 'error',
        title,
        text: message,
        confirmButtonText: 'Entendido'
    });
};

function showWakeUpBanner() {
    if (isBannerVisible) return;
    isBannerVisible = true;

    showLoading('Despertando servidor...');
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
            MySwal().fire({
                title: 'Error de conexión',
                text: 'El servidor no pudo despertar. Intenta recargar la página.',
                icon: 'error',
                confirmButtonText: 'Entendido',
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
