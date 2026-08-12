import axiosClient from '@/lib/axiosClient';
import { normalizeConversationSummary } from '@/lib/messaging/conversationNormalizer';

const messagingService = {
  createConversationForStudent: async (courseId) => {
    const response = await axiosClient.post('/conversations', { courseId });
    return normalizeConversationSummary(response.data.data);
  },

  createConversationForInstructor: async (courseId, studentId) => {
    const response = await axiosClient.post('/conversations', { courseId, studentId });
    return normalizeConversationSummary(response.data.data);
  },

  getConversations: async ({ page = 0, size = 20 } = {}) => {
    const response = await axiosClient.get('/conversations', {
      params: { page, size },
    });
    const data = response.data.data;
    if (!data) return { content: [], totalElements: 0, totalPages: 0 };

    if (Array.isArray(data.content)) {
      return {
        ...data,
        content: data.content.map(normalizeConversationSummary),
      };
    }

    if (Array.isArray(data.items)) {
      return {
        ...data,
        items: data.items.map(normalizeConversationSummary),
      };
    }

    if (Array.isArray(data)) {
      return data.map(normalizeConversationSummary);
    }

    return data;
  },

  getConversation: async (conversationId) => {
    if (!conversationId) return null;
    const response = await axiosClient.get(`/conversations/${conversationId}`);
    return normalizeConversationSummary(response.data.data);
  },

  getMessages: async (conversationId, { cursor, limit = 30 } = {}) => {
    if (!conversationId) return { items: [], nextCursor: null, hasNext: false };
    const response = await axiosClient.get(`/conversations/${conversationId}/messages`, {
      params: { cursor, limit },
    });
    return response.data.data;
  },

  sendMessage: async (conversationId, { clientMessageId, content }) => {
    const response = await axiosClient.post(`/conversations/${conversationId}/messages`, {
      clientMessageId,
      content,
      type: 'TEXT',
    });
    return response.data.data;
  },

  markConversationRead: async (conversationId, messageId) => {
    const response = await axiosClient.patch(`/conversations/${conversationId}/read`, {
      messageId,
    });
    return response.data.data;
  },
};

export default messagingService;
