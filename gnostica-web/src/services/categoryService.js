import axios from 'axios';

const API_URL = 'http://localhost:8080/api/categories';

const getAllCategories = async (page = 1, limit = 10, search = "", status = "all") => {
    const params = new URLSearchParams({ page, limit });
    if (search && search.trim() !== "") {
        params.append("search", search.trim());
    }
    if (status !== "all") {
        params.append("status", status === "active" ? "true" : "false");
    }
    const response = await axios.get(API_URL, { params });
    return response.data;
};

const createCategory = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

const updateCategory = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

const updateStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/${id}/status?status=${status}`);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
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
