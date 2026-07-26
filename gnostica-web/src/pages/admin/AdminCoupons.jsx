import { CouponManagementPage } from '@/pages/instructor/components/CouponManagementPage';

export default function AdminCoupons() {
  return (
    <CouponManagementPage
      title="Phiếu giảm giá"
      description="Tạo và quản lý các mã ưu đãi do tài khoản quản trị phát hành."
      adminLayout
    />
  );
}
