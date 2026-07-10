import axiosClient from '@/lib/axiosClient';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('questionService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const generateAiQuestions = async (courseId, file, count, level) => {
    const idToUse = courseId || 0;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('count', count);
    formData.append('level', level);

    const response = await axiosClient.post(`/instructor/courses/${idToUse}/questions/ai-generate`, formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

const saveDraftQuestions = async (courseId, questions) => {
    const response = await axiosClient.post(`/instructor/courses/${courseId}/questions/drafts`, questions, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getDraftQuestions = async (courseId) => {
    const response = await axiosClient.get(`/instructor/courses/${courseId}/questions/drafts`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const saveQuestionBank = async (courseId, questions) => {
    const response = await axiosClient.put(`/instructor/courses/${courseId}/questions`, questions, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const questionService = {
    generateAiQuestions,
    saveDraftQuestions,
    getDraftQuestions,
    saveQuestionBank,
};

export default questionService;
