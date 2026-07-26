import api from '../../config/api';

const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response;
        } catch (error) {
            throw error;
        }
    },

    googleLogin: async (payload) => {
        try {
            const response = await api.post('/auth/google', payload);
            return response;
        } catch (error) {
            throw error;
        }
    },

    getOAuth2User: async (email) => {
        try {
            const response = await api.get('/auth/user', { params: { email } });
            return response;
        } catch (error) {
            throw error;
        }
    },

    register: async (fullName, email, password) => {
        try {
            const response = await api.post('/auth/register', { 
                fullName, 
                email, 
                password 
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    verifyOTP: async (email, code) => {
        try {
            const response = await api.post(`/auth/verify`, null, {
                params: { email, code }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    resendOTP: async (email) => {
        try {
            const response = await api.post(`/auth/resend-otp`, null, {
                params: { email }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await api.post(`/auth/forgot-password`, null, {
                params: { email }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (email, code, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', { 
                email, 
                code, 
                newPassword 
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default authService;

