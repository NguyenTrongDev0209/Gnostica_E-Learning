import axiosClient from '@/lib/axiosClient';

const API_URL = '/follow';

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            'Authorization': `Bearer ${user?.token}`
        }
    };
};

const getFollowedInstructors = async () => {
    const response = await axiosClient.get(`${API_URL}/instructors`, getAuthHeaders());
    return response.data;
};

const toggleFollow = async (instructorId) => {
    const response = await axiosClient.post(`${API_URL}/toggle/${instructorId}`, {}, getAuthHeaders());
    return response.data;
};

const checkFollowing = async (instructorId) => {
    const response = await axiosClient.get(`${API_URL}/check/${instructorId}`, getAuthHeaders());
    return response.data;
};

const followingService = {
    getFollowedInstructors,
    toggleFollow,
    checkFollowing
};

export default followingService;
