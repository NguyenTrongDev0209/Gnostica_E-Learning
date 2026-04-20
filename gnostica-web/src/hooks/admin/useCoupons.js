import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import couponService from '@/services/couponService';

export function useCoupons(options = {}) {
  const { mine = false } = options;
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = mine
        ? await couponService.getMyCoupons()
        : await couponService.getCoupons();
      if (response && response.data) {
        setCoupons(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const addCoupon = async (payload) => {
    try {
      await couponService.createCoupon(payload);
      toast.success("Thêm mã giảm giá thành công!");
      await fetchCoupons();
      return { success: true };
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Có lỗi xảy ra khi tạo mã giảm giá.";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const removeCoupon = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return false;

    try {
      await couponService.deleteCoupon(id);
      toast.success("Xóa mã giảm giá thành công!");
      await fetchCoupons();
      return true;
    } catch (error) {
      toast.error("Không thể xóa mã giảm giá");
      return false;
    }
  };

  const toggleCouponStatus = async (coupon) => {
    // 1 -> 0, 0 -> 1. If 2 or 3, maybe just switch to 1 (active) anyway for editing.
    const newStatus = coupon.status === 1 ? 0 : 1;
    try {
      await couponService.updateCouponStatus(coupon.id, newStatus);
      toast.success("Cập nhật trạng thái ưu đãi thành công!");
      await fetchCoupons();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
      return false;
    }
  };

  return { coupons, isLoading, addCoupon, removeCoupon, toggleCouponStatus, fetchCoupons };
}
