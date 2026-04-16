import api from './api';

const RESOURCE_PATH = '/ai'; 

export const sendChatMessage = async (messages) => {
    try {
        const response = await api.post(`${RESOURCE_PATH}/chat`, {
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
