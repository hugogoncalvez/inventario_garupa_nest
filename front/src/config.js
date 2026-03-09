import axios from 'axios';
import Swal from 'sweetalert2';

export const URI = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Instancia global de Axios con wake-up automático para Render (tier gratuito)
// ---------------------------------------------------------------------------

const api = axios.create({ baseURL: URI });

let isWakingUp = false;

function showWakeUpBanner() {
    Swal.fire({
        title: 'El servidor está despertando...',
        html: 'La instancia gratuita de Render se "duerme" tras 15 min de inactividad.<br><b>Por favor, espera unos segundos (hasta 60s).</b>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
        background: '#fff',
        color: '#1976d2',
        backdrop: `
            rgba(25, 118, 210, 0.4)
            left top
            no-repeat
        `
    });
}

function hideWakeUpBanner() {
    Swal.close();
}

async function waitForServer(timeoutMs = 90000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            await axios.get(URI, { timeout: 10000 });
            return true; // servidor despierto
        } catch {
            await new Promise(r => setTimeout(r, 5000));
        }
    }
    return false; // timeout
}

// Interceptor de respuesta: detecta fallo de red y reintenta automáticamente
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Solo actúa si es un error de red (sin respuesta del servidor)
        // y si no es un reintento ya en curso
        const isNetworkError = !error.response;
        const isRetry = originalRequest._wakeRetry;

        if (isNetworkError && !isRetry) {
            originalRequest._wakeRetry = true;

            if (!isWakingUp) {
                isWakingUp = true;
                showWakeUpBanner();
                const serverUp = await waitForServer();
                hideWakeUpBanner();
                isWakingUp = false;

                if (!serverUp) {
                    return Promise.reject(new Error('El servidor no respondió después de 90 segundos.'));
                }
            } else {
                // Otro request llegó mientras el wake-up ya estaba en curso: esperar
                await new Promise(r => setTimeout(r, 15000));
            }

            // Reintentar la petición original
            return api(originalRequest);
        }

        return Promise.reject(error);
    }
);

export default api;
