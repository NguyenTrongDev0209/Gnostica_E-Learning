import axiosClient from '@/lib/axiosClient';

const API_URL = '/certificates';

export const certificateService = {
  getCertificateByUrl: async (certifiUrl) => {
    const res = await axiosClient.get(`${API_URL}/${certifiUrl}`);
    return res.data;
  }
};

export default certificateService;
