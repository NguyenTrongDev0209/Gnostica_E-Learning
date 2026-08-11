import axiosClient from "@/lib/axiosClient";

export const systemService = {
  getSystemMetrics: async () => {
    const response = await axiosClient.get("/admin/system/metrics");
    return response.data;
  },
};
