import axios from 'axios';

const API_URL = 'http://localhost:8080/api/instructor';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('InstructorService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getMyStudents = async () => {
    const response = await axios.get(`${API_URL}/students`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const getStudentCourses = async (studentId) => {
    const response = await axios.get(`${API_URL}/students/${studentId}/courses`, {
        headers: getAuthHeaders()
    });
    return response.data.data;
};

const instructorService = {
    getMyStudents,
    getStudentCourses
};

export default instructorService;
