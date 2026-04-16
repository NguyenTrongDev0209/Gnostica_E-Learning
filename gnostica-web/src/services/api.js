import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để tự động chèn token vào header của mỗi request
api.interceptors.request.use(
    (config) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (error) {
                console.error('API Interceptor: Error parsing user from localStorage', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Có thể thêm interceptor cho response để xử lý lỗi 401 (hết hạn token) tại đây nếu cần
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Xử lý khi token hết hạn (ví dụ: đăng xuất hoặc refresh token)
            console.warn('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
            // localStorage.removeItem('user');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
