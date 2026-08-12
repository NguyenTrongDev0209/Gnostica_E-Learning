import axiosClient from '@/lib/axiosClient';

const API_URL = '/ai'; // Adjust base URL if needed

export const sendChatMessage = async (messages, sessionId = null) => {
    try {
        const response = await axiosClient.post(`${API_URL}/chat`, {
            sessionId: sessionId,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            }))
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message to AI:', error);
        throw error;
    }
};

export const uploadChatImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axiosClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.url;
    } catch (error) {
        console.error('Error uploading chat image:', error);
        throw error;
    }
};

export const getAiQuota = async () => {
    try {
        const response = await axiosClient.get(`${API_URL}/quota`);
        return response.data?.data || response.data || { dailyLimit: 15, remaining: 15, used: 0 };
    } catch (error) {
        console.error('Error fetching AI quota:', error);
        return { dailyLimit: 15, remaining: 15, used: 0 };
    }
};

