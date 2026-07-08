import api from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const accountService = {
    /**
     * Upload avatar (multipart/form-data)
     * @param {Object} file - { uri, type, name }
     * @param {string} email
     */
    updateAvatar: async (file, email) => {
        const token = await AsyncStorage.getItem('token');
        const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.34:8080/api';

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.name || 'avatar.jpg',
        });
        formData.append('email', email);

        const response = await fetch(`${BASE_URL}/account/avatar`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) throw data || { message: 'Upload avatar tháº¥t báº¡i' };
        return data;
    },

    /**
     * Cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n hÃ³a
     * @param {Object} dto - PersonalizationDTO
     * @param {string} email
     */
    updatePersonalization: (dto, email) => {
        return api.put('/account/personalization', dto, {
            params: { email },
        });
    },

    /**
     * Thay Ä‘á»•i máº­t kháº©u
     * @param {string} email
     * @param {string} currentPassword
     * @param {string} newPassword
     */
    changePassword: (email, currentPassword, newPassword) => {
        return api.put('/account/change-password', {
            email,
            currentPassword,
            newPassword
        });
    },
};

export default accountService;

