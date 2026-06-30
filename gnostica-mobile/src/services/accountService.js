import api from './api';
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
        if (!response.ok) throw data || { message: 'Upload avatar thất bại' };
        return data;
    },

    /**
     * Cập nhật thông tin cá nhân hóa
     * @param {Object} dto - PersonalizationDTO
     * @param {string} email
     */
    updatePersonalization: (dto, email) => {
        return api.put('/account/personalization', dto, {
            params: { email },
        });
    },
};

export default accountService;
