import axios from 'axios';

// Create a centralized Axios instance
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true, // IMPORTANT: Allows sending and receiving HTTP-Only cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
