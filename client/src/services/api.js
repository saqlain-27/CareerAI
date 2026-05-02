import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true, // IMPORTANT: Allows sending and receiving HTTP-Only cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Global interceptor to handle expired JWT tokens (401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Dispatch a custom event so the React layer can handle the routing smoothly
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default api;
