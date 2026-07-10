import api from '../../config/api';

const couponService = {
    /**
     * Láº¥y táº¥t cáº£ mÃ£ giáº£m giÃ¡ (admin)
     * Response: ResponseDTO<List<CouponResponse>>
     */
    getAll: () => {
        return api.get('/coupons');
    },

    /**
     * Láº¥y mÃ£ giáº£m giÃ¡ kháº£ dá»¥ng cho user hiá»‡n táº¡i
     * Response: ResponseDTO<List<CouponResponse>>
     */
    getMyCoupons: () => {
        return api.get('/coupons/me');
    },

    /**
     * Kiá»ƒm tra tÃ­nh há»£p lá»‡ cá»§a mÃ£ giáº£m giÃ¡
     * Response: ResponseDTO<CouponResponse> (status 200 náº¿u há»£p lá»‡, 400 náº¿u khÃ´ng)
     * @param {string} code
     */
    validate: (code) => {
        return api.get(`/coupons/validate/${code}`);
    },
};

export default couponService;

