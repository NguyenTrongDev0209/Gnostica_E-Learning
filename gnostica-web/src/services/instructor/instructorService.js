import {
    Users,
    MessageSquare,
    Star,
    Activity,
    DollarSign,
    HelpCircle,
    FileEdit,
    AlertCircle
} from "lucide-react";
import axiosClient from '@/lib/axiosClient';

const API_URL = '/instructor';
const PUBLIC_API_URL = '/instructors';
const APP_API_URL = '/instructor-applications';

const getMyStudents = async () => {
    const response = await axiosClient.get(`${API_URL}/students`);
    return response.data;
};

const getStudentCourses = async (studentId) => {
    const response = await axiosClient.get(`${API_URL}/students/${studentId}/courses`);
    return response.data;
};

// Public instructor endpoints
const getInstructorProfile = async (id) => {
    const response = await axiosClient.get(`${PUBLIC_API_URL}/${id}/profile`);
    return response.data;
};

const getInstructorCourses = async (id) => {
    const response = await axiosClient.get(`${PUBLIC_API_URL}/${id}/courses`);
    return response.data;
};

const getInstructorList = async () => {
    const response = await axiosClient.get(`${PUBLIC_API_URL}/list`);
    return response.data;
};

// Instructor applications
const createApplication = async (data) => {
    const response = await axiosClient.post(APP_API_URL, data);
    return response.data;
};

const uploadDocument = async (endpoint, formData) => {
    const response = await axiosClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

const getApplications = async (status) => {
    const response = await axiosClient.get(`${APP_API_URL}?status=${status}`);
    return response.data;
};

const getApplicationByAccountId = async (accountId) => {
    const response = await axiosClient.get(`${APP_API_URL}/${accountId}`);
    return response.data;
};

const approveApplication = async (id) => {
    const response = await axiosClient.put(`${APP_API_URL}/${id}/approve`, {});
    return response.data;
};

const rejectApplication = async (id, reason) => {
    const response = await axiosClient.put(`${APP_API_URL}/${id}/reject`, { reason });
    return response.data;
};




const instructorService = {
    getMyStudents,
    getStudentCourses,
    getInstructorProfile,
    getInstructorCourses,
    getInstructorList,
    createApplication,
    uploadDocument,
    getApplications,
    getApplicationByAccountId,
    approveApplication,
    rejectApplication
};

export default instructorService;
