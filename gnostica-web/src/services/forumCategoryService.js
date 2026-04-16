import axios from "axios";

const API_URL = "http://localhost:8080/api/forum-categories";

const getAllCategories = () => {
  return axios.get(API_URL);
};

const createCategory = (category) => {
  return axios.post(API_URL, category);
};

const updateCategory = (id, category) => {
  return axios.put(`${API_URL}/${id}`, category);
};

const deleteCategory = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};

const updateStatus = (id, status) => {
  return axios.put(`${API_URL}/${id}/status`, { status });
};

const forumCategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateStatus,
};

export default forumCategoryService;
