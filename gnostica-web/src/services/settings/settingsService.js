import axiosClient from "@/lib/axiosClient";

const unwrap = (response) => response.data?.data ?? response.data;

export const getPublicSiteConfig = async () => {
  const response = await axiosClient.get("/public/site-config");
  return unwrap(response) || {};
};

export const getAdminSettings = async () => {
  const response = await axiosClient.get("/admin/settings");
  return unwrap(response) || {};
};

export const updateAdminSettings = async (values) => {
  const response = await axiosClient.put("/admin/settings", { values });
  return unwrap(response) || {};
};

export const uploadSettingImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosClient.post("/admin/settings/assets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data?.data?.url || response.data?.url;
};

export const getPublicBanners = async (position) => {
  const response = await axiosClient.get("/public/banners", { params: { position } });
  return unwrap(response) || [];
};

export const getAdminBanners = async () => {
  const response = await axiosClient.get("/admin/banners");
  return unwrap(response) || [];
};

export const createAdminBanner = async (payload) => {
  const response = await axiosClient.post("/admin/banners", payload);
  return unwrap(response);
};

export const updateAdminBanner = async ({ id, ...payload }) => {
  const response = await axiosClient.put(`/admin/banners/${id}`, payload);
  return unwrap(response);
};

export const deleteAdminBanner = async (id) => {
  await axiosClient.delete(`/admin/banners/${id}`);
  return id;
};

export const getPublicPage = async (slug) => {
  const response = await axiosClient.get(`/public/pages/${slug}`);
  return unwrap(response);
};

export const getAdminPages = async () => {
  const response = await axiosClient.get("/admin/pages");
  return unwrap(response) || [];
};

export const createAdminPage = async (payload) => {
  const response = await axiosClient.post("/admin/pages", payload);
  return unwrap(response);
};

export const updateAdminPage = async ({ id, ...payload }) => {
  const response = await axiosClient.put(`/admin/pages/${id}`, payload);
  return unwrap(response);
};

export const deleteAdminPage = async (id) => {
  await axiosClient.delete(`/admin/pages/${id}`);
  return id;
};
