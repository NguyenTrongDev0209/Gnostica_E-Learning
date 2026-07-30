import axios from 'axios';
import useAuthStore from '@/store/useAuthStore';
import { API_URL } from '@/config/publicUrl';

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm một interceptor cho request
const PUBLIC_AUTH_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/google',
    '/auth/verify',
    '/auth/resend-otp',
    '/auth/forgot-password',
    '/auth/reset-password',
];

const isPublicAuthRequest = (url = '') =>
    PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url === endpoint || url.startsWith(`${endpoint}?`));

axiosClient.interceptors.request.use(
    function (config) {
        // Never attach a stale token to a request that starts a new session.
        if (isPublicAuthRequest(config.url)) {
            delete config.headers.Authorization;
            return config;
        }

        // Gắn token vào header nếu có
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (error) {
                console.error('Lỗi khi parse user từ localStorage:', error);
            }
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Thêm một interceptor cho response
axiosClient.interceptors.response.use(
    function (response) {
        // Trả về nguyên response để tương thích với các file cũ đang gọi response.data
        return response;
    },
    function (error) {
        if (error.response && error.response.status === 401) {
            // Lỗi 401: Unauthorized (Token hết hạn hoặc không hợp lệ)
            // Public auth endpoints handle their own validation errors. Calling
            // logout here would send another request and can cause a 401 loop.
            if (!isPublicAuthRequest(error.config?.url)) {
                localStorage.removeItem('user');
                useAuthStore.setState({ user: null });

                if (window.location.pathname !== '/login') {
                    window.location.assign('/login');
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
