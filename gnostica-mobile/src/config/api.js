import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

// Sử dụng biến môi trường từ file .env hoặc IP mạng cục bộ
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.176.13.240:8080/api';


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
            const responseText = await response.text();
            let data;
            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch (_) {
                data = { message: responseText || `Server error (${response.status})` };
            }
            
            if (response.status === 401) {
                DeviceEventEmitter.emit('auth.logout');
                throw data || { message: 'Phiên đăng nhập đã hết hạn' };
            }

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
    upload: async (endpoint, formData, options = {}) => {
        const token = await AsyncStorage.getItem('token');
        let url = `${BASE_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    ...options.headers,
                },
                body: formData,
            });
            const responseText = await response.text();
            let data;
            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch (_) {
                data = { message: responseText || `Upload failed (${response.status})` };
            }
            
            if (response.status === 401) {
                DeviceEventEmitter.emit('auth.logout');
                throw data || { message: 'Phiên đăng nhập đã hết hạn' };
            }

            if (!response.ok) {
                throw data || { message: 'Upload failed' };
            }
            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default api;
