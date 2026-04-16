import api from './api';

const RESOURCE_PATH = '/coupons';

const createCoupon = async (data) => {
    const response = await api.post(RESOURCE_PATH, data);
    return response.data;
};

const getCoupons = async () => {
    const response = await api.get(RESOURCE_PATH);
    return response.data;
};

const getMyCoupons = async () => {
    const response = await api.get(`${RESOURCE_PATH}/me`);
    return response.data;
};

const deleteCoupon = async (id) => {
    const response = await api.delete(`${RESOURCE_PATH}/${id}`);
    return response.data;
};

const couponService = {
    createCoupon,
    getCoupons,
    getMyCoupons,
    deleteCoupon,
};

export default couponService;
