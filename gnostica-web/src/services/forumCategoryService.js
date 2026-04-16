import api from "./api";

const RESOURCE_PATH = "/forum-categories";

const getAllCategories = () => {
  return api.get(RESOURCE_PATH);
};

const createCategory = (category) => {
  return api.post(RESOURCE_PATH, category);
};

const updateCategory = (id, category) => {
  return api.put(`${RESOURCE_PATH}/${id}`, category);
};

const deleteCategory = (id) => {
  return api.delete(`${RESOURCE_PATH}/${id}`);
};

const updateStatus = (id, status) => {
  return api.put(`${RESOURCE_PATH}/${id}/status`, { status });
};

const forumCategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateStatus,
};

export default forumCategoryService;
