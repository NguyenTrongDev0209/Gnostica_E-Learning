import api from './api';

const RESOURCE_PATH = '/categories';

const getAllCategories = async (page = 1, limit = 10, search = "", status = "all") => {
    const params = new URLSearchParams({ page, limit });
    if (search && search.trim() !== "") {
        params.append("search", search.trim());
    }
    if (status !== "all") {
        params.append("status", status === "active" ? "true" : "false");
    }
    const response = await api.get(RESOURCE_PATH, { params });
    return response.data;
};

const createCategory = async (data) => {
    const response = await api.post(RESOURCE_PATH, data);
    return response.data;
};

const updateCategory = async (id, data) => {
    const response = await api.put(`${RESOURCE_PATH}/${id}`, data);
    return response.data;
};

const updateStatus = async (id, status) => {
    const response = await api.patch(`${RESOURCE_PATH}/${id}/status?status=${status}`, null);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await api.delete(`${RESOURCE_PATH}/${id}`);
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
