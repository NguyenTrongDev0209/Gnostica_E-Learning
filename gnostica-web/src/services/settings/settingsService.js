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
