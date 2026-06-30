import api from './api';

const couponService = {
    /**
     * Lấy tất cả mã giảm giá (admin)
     * Response: ResponseDTO<List<CouponResponse>>
     */
    getAll: () => {
        return api.get('/coupons');
    },

    /**
     * Lấy mã giảm giá khả dụng cho user hiện tại
     * Response: ResponseDTO<List<CouponResponse>>
     */
    getMyCoupons: () => {
        return api.get('/coupons/me');
    },

    /**
     * Kiểm tra tính hợp lệ của mã giảm giá
     * Response: ResponseDTO<CouponResponse> (status 200 nếu hợp lệ, 400 nếu không)
     * @param {string} code
     */
    validate: (code) => {
        return api.get(`/coupons/validate/${code}`);
    },
};

export default couponService;
