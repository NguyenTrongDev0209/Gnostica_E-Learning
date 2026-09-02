import api from '../../config/api';

const couponService = {
    /**
     * Lấy tất cả mã giảm giá (admin)
     * Response: ResponseDTO<List<CouponResponse>>
     */
    getAll: () => {
        return api.get('/checkout/coupons');
    },

    /**
     * Lấy mã giảm giá khả dụng cho user hiện tại
     * Response: ResponseDTO<List<CouponResponse>>
     */
    getMyCoupons: () => {
        return api.get('/checkout/coupons/me');
    },

    /**
     * Kiểm tra tính hợp lệ của mã giảm giá
     * Response: ResponseDTO<CouponResponse> (status 200 nếu hợp lệ, 400 nếu không)
     * Backend bắt buộc kèm courseId (để kiểm tra scope + tính % theo đơn).
     * @param {string} code
     * @param {string} courseId
     */
    validate: (code, courseId) => {
        return api.get(`/checkout/coupons/validate/${code}`, { params: { courseId } });
    },
};

export default couponService;


