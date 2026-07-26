import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import couponService from '@/services/order/couponService';

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export function useCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await couponService.getMyCoupons();
      setCoupons(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch coupons', error);
      toast.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const addCoupon = async (payload) => {
    try {
      await couponService.createCoupon(payload);
      toast.success('Thêm mã giảm giá thành công!');
      await fetchCoupons();
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Có lỗi xảy ra khi tạo mã giảm giá.');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const editCoupon = async (id, payload) => {
    try {
      await couponService.updateCoupon(id, payload);
      toast.success('Cập nhật mã giảm giá thành công!');
      await fetchCoupons();
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Không thể cập nhật mã giảm giá.');
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const removeCoupon = async (id) => {
    try {
      await couponService.deleteCoupon(id);
      toast.success('Đã xóa mã giảm giá.');
      await fetchCoupons();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể xóa mã giảm giá'));
      return false;
    }
  };

  const toggleCouponStatus = async (coupon) => {
    const newStatus = coupon.status === 1 ? 0 : 1;
    try {
      await couponService.updateCouponStatus(coupon.id, newStatus);
      toast.success('Đã cập nhật trạng thái ưu đãi.');
      await fetchCoupons();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể cập nhật trạng thái'));
      return false;
    }
  };

  return { coupons, isLoading, addCoupon, editCoupon, removeCoupon, toggleCouponStatus, fetchCoupons };
}
