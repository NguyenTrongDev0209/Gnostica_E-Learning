import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';

// Hàm lấy token từ localStorage để gắn vào Header
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    console.log("CategoryService: userStr from localStorage:", userStr ? "Found" : "Not Found");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                console.log("CategoryService: Token found, attaching to header");
                return { Authorization: `Bearer ${user.token}` };
            } else {
                console.warn("CategoryService: User object found but no token present!");
            }
        } catch (error) {
            console.error('CategoryService: Error parsing user from localStorage', error);
        }
    } else {
        console.warn("CategoryService: No user found in localStorage!");
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
    const response = await axios.get(API_URL, { 
        params,
        headers: getAuthHeaders() 
    });
    return response.data;
};

const createCategory = async (data) => {
    const response = await axios.post(API_URL, data, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};

const updateCategory = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};

const updateStatus = async (id, status) => {
    // Với axios.patch, tham số thứ 2 là data (body), tham số thứ 3 là config
    const response = await axios.patch(`${API_URL}/${id}/status?status=${status}`, null, { 
        headers: getAuthHeaders() 
    });
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, { 
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
