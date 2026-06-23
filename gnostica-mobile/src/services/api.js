import AsyncStorage from '@react-native-async-storage/async-storage';

// Sử dụng IP của máy từ file .env
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.34:8080/api';

const api = {
    request: async (endpoint, options = {}) => {
        const token = await AsyncStorage.getItem('token');
        
        let url = `${BASE_URL}${endpoint}`;
        
        // Thêm query params nếu có
        if (options.params) {
            const query = Object.keys(options.params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`)
                .join('&');
            url += `?${query}`;
        }
        
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw data || { message: 'Something went wrong' };
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    },

    get: (endpoint, options = {}) => api.request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => api.request(endpoint, { 
        ...options, 
        method: 'POST', 
        body: JSON.stringify(body) 
    }),
    put: (endpoint, body, options = {}) => api.request(endpoint, { 
        ...options, 
        method: 'PUT', 
        body: JSON.stringify(body) 
    }),
    delete: (endpoint, options = {}) => api.request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
