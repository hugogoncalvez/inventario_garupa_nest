import axios from 'axios';

export const URI = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Instancia global de Axios con wake-up automático para Render (tier gratuito)
// ---------------------------------------------------------------------------

const api = axios.create({ baseURL: URI });

let isWakingUp = false;
let wakeUpOverlay = null;

function showWakeUpBanner() {
    if (wakeUpOverlay) return;
    wakeUpOverlay = document.createElement('div');
    wakeUpOverlay.id = 'render-wakeup-banner';
    wakeUpOverlay.innerHTML = `
        <div style="
            position: fixed; top: 0; left: 0; width: 100%; z-index: 99999;
            background: linear-gradient(90deg, #1976d2, #42a5f5);
            color: white; text-align: center; padding: 12px 16px;
            font-family: sans-serif; font-size: 14px; font-weight: 500;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center; gap: 10px;
        ">
            <span style="font-size:20px">⏳</span>
            Reconectando con el servidor (puede tardar hasta 60 seg)...
        </div>
    `;
    document.body.prepend(wakeUpOverlay);
}

function hideWakeUpBanner() {
    if (wakeUpOverlay) {
        wakeUpOverlay.remove();
        wakeUpOverlay = null;
    }
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
