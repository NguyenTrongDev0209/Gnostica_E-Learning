import axios from 'axios';

const API_URL = 'http://localhost:8080/api/follow';

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            'Authorization': `Bearer ${user?.token}`
        }
    };
};

const getFollowedInstructors = async () => {
    const response = await axios.get(`${API_URL}/instructors`, getAuthHeaders());
    return response.data;
};

const toggleFollow = async (instructorId) => {
    const response = await axios.post(`${API_URL}/toggle/${instructorId}`, {}, getAuthHeaders());
    return response.data;
};

const checkFollowing = async (instructorId) => {
    const response = await axios.get(`${API_URL}/check/${instructorId}`, getAuthHeaders());
    return response.data;
};

const followingService = {
    getFollowedInstructors,
    toggleFollow,
    checkFollowing
};

export default followingService;
