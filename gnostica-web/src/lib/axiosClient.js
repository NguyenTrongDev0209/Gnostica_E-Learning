import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm một interceptor cho request
axiosClient.interceptors.request.use(
    function (config) {
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
        return Promise.reject(error);
    }
);

export default axiosClient;
