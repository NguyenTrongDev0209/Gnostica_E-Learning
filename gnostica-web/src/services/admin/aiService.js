import axiosClient from '@/lib/axiosClient';

const API_URL = '/ai'; // Adjust base URL if needed

export const sendChatMessage = async (messages) => {
    try {
        const response = await axiosClient.post(`${API_URL}/chat`, {
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
