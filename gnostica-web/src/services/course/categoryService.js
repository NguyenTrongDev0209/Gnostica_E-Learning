import axiosClient from '@/lib/axiosClient';

const API_URL = '/categories';

// Hàm lấy token từ localStorage để gắn vào Header
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('CategoryService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const getAllCategories = async (page = 1, limit = 10, search = "", status = "all") => {
    const params = new URLSearchParams({ page, limit });
    if (search && search.trim() !== "") {
        params.append("search", search.trim());
    }
    if (status !== "all") {
        params.append("status", status === "active" ? "true" : "false");
    }
    const response = await axiosClient.get(API_URL, { 
        params,
        headers: getAuthHeaders() 
    });
    return response.data;
};

const createCategory = async (data) => {
    const response = await axiosClient.post(API_URL, data, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};

const updateCategory = async (id, data) => {
    const response = await axiosClient.put(`${API_URL}/${id}`, data, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};

const updateStatus = async (id, status) => {
    const response = await axiosClient.patch(`${API_URL}/${id}/status?status=${status}`, null, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await axiosClient.delete(`${API_URL}/${id}`, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};

const categoryService = {
    getAllCategories,
    createCategory,
    updateCategory,
    updateStatus,
    deleteCategory
};

export default categoryService;
