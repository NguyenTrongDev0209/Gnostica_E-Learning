import axios from 'axios';

const API_URL = 'http://localhost:8080/api/coupons';

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
    const response = await axios.post(API_URL, data, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getCoupons = async () => {
    const response = await axios.get(API_URL, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const getMyCoupons = async () => {
    const response = await axios.get(`${API_URL}/me`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const deleteCoupon = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const validateCoupon = async (code) => {
    const response = await axios.get(`${API_URL}/validate/${code}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

const updateCouponStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}/status`, null, {
        params: { status },
        headers: getAuthHeaders()
    });
    return response.data;
};

const couponService = {
    createCoupon,
    getCoupons,
    getMyCoupons,
    deleteCoupon,
    validateCoupon,
    updateCouponStatus,
};

export default couponService;
