import axiosClient from "@/lib/axiosClient";

const API_URL = "/forum-categories";

const getAllCategories = () => {
  return axiosClient.get(API_URL);
};

const createCategory = (category) => {
  return axiosClient.post(API_URL, category);
};

const updateCategory = (id, category) => {
  return axiosClient.put(`${API_URL}/${id}`, category);
};

const deleteCategory = (id) => {
  return axiosClient.delete(`${API_URL}/${id}`);
};

const updateStatus = (id, status) => {
  return axiosClient.put(`${API_URL}/${id}/status`, { status });
};

const forumCategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateStatus,
};

export default forumCategoryService;
