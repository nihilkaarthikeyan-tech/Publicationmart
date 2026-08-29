import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Keep a visitor's work when the CSRF token goes stale.
 *
 * A page left open long enough gets a 419 on its next submit. Laravel's
 * handler then redirects to login, and whatever was typed is gone. But a
 * stale token and a dead session look identical from the browser: most 419s
 * are simply an old token on a session that is still perfectly alive.
 *
 * So on a 419 we ask the server which it is. If the session is still good we
 * take the fresh token, retry the request once, and the visitor never knows
 * anything happened — their form submits normally. Only a genuinely expired
 * session falls through to the redirect.
 *
 * Inertia issues its requests through this same axios default instance, so
 * page visits and form posts are both covered.
 */
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const isTokenMismatch = error.response?.status === 419;

        if (!isTokenMismatch || !original) {
            return Promise.reject(error);
        }

        // A second 419 means the session really is gone. Send the visitor to
        // login rather than leaving them staring at a failed request, and stop
        // — looping would hammer the server.
        if (original.__csrfRetried) {
            window.location.href = '/login';
            return Promise.reject(error);
        }

        try {
            const { data } = await axios.get('/session/token', {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                __csrfRetried: true,
            });

            if (!data?.token) return Promise.reject(error);

            // Update every place the token is read from, so subsequent
            // requests and any server-rendered form pick up the new one.
            const meta = document.querySelector('meta[name="csrf-token"]');
            if (meta) meta.setAttribute('content', data.token);
            axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;
            document
                .querySelectorAll('input[name="_token"]')
                .forEach((input) => { input.value = data.token; });

            original.__csrfRetried = true;
            original.headers = { ...original.headers, 'X-CSRF-TOKEN': data.token };
            if (typeof original.data === 'string' && original.data.includes('_token=')) {
                original.data = original.data.replace(/_token=[^&]*/, '_token=' + encodeURIComponent(data.token));
            }

            return axios(original);
        } catch (e) {
            // Refresh itself failed — let the original 419 through to the
            // normal expired-session redirect.
            return Promise.reject(error);
        }
    },
);

/**
 * Laravel Echo - Real-Time Broadcasting with Pusher
 * This enables real-time updates for admin approvals and notifications
 */
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap2',
    forceTLS: true,
    // Enable debug mode in development
    // enabledTransports: ['ws', 'wss'],
});

// Log connection status for debugging
if (import.meta.env.DEV) {
    window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully');
    });

    window.Echo.connector.pusher.connection.bind('error', (err) => {
        console.error('❌ Pusher connection error:', err);
    });
}
