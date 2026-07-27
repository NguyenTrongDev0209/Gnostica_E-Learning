import axiosClient from '@/lib/axiosClient';

const API_URL = '/coupons';

const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.token) {
                return { Authorization: `Bearer ${user.token}` };
            }
        } catch (error) {
            console.error('CouponService: Error parsing user from localStorage', error);
        }
    }
    return {};
};

const createCoupon = async (data) => {
    const response = await axiosClient.post(API_URL, data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getCoupons = async () => {
    const response = await axiosClient.get(API_URL, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getMyCoupons = async () => {
    const response = await axiosClient.get(`${API_URL}/me`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteCoupon = async (id) => {
    const response = await axiosClient.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getAdminCoupons = async (ownerType) => {
    const response = await axiosClient.get(`${API_URL}/admin`, {
        params: { ownerType },
        headers: getAuthHeaders()
    });
    return response.data;
};

const getScopeCourses = async () => {
    const response = await axiosClient.get(`${API_URL}/scope-options/courses`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getScopeCategories = async () => {
    const response = await axiosClient.get(`${API_URL}/scope-options/categories`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateCoupon = async (id, data) => {
    const response = await axiosClient.put(`${API_URL}/${id}`, data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const validateCoupon = async (code, courseId) => {
    const response = await axiosClient.get(`${API_URL}/validate/${code}`, {
        headers: getAuthHeaders(),
        params: { courseId },
    });
    return response.data;
};

const updateCouponStatus = async (id, status) => {
    const response = await axiosClient.put(`${API_URL}/${id}/status`, null, {
        params: { status },
        headers: getAuthHeaders()
    });
    return response.data;
};

const couponService = {
    createCoupon,
    getCoupons,
    getMyCoupons,
    getAdminCoupons,
    getScopeCourses,
    getScopeCategories,
    deleteCoupon,
    updateCoupon,
    validateCoupon,
    updateCouponStatus,
};

export default couponService;
