import axios from 'axios';

// Fallback logic
let base = import.meta.env.VITE_API_URL || '';

if (!base) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        base = 'http://localhost:5000';
    } else {
        base = 'https://hrm-backend-b3sz.onrender.com';
    }
}

// Remove trailing slash if present
base = base.replace(/\/$/, '');

// If base ends with /api, remove it so we can append it consistently
if (base.endsWith('/api')) {
    base = base.substring(0, base.length - 4);
}

export const BASE_URL = base;
let API_URL = `${base}/api`;

const api = axios.create({
    baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Auto logout on 401 (Unauthorized), but SKIP if we are already trying to login
            // to avoid reloading the page when user enters wrong credentials.
            if (!error.config.url.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
