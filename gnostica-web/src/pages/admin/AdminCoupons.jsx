import { useSearchParams } from 'react-router-dom';
import { CouponManagementPage } from '@/pages/instructor/components/CouponManagementPage';

export default function AdminCoupons() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'instructors' ? 'instructors' : 'platform';
  const isInstructorTab = tab === 'instructors';

  return (
    <CouponManagementPage
      title={isInstructorTab ? 'Phiếu giảm giá của Giảng viên' : 'Phiếu giảm giá nền tảng'}
      description={isInstructorTab
        ? 'Theo dõi các mã ưu đãi do Giảng viên phát hành.'
        : 'Tạo và quản lý các mã ưu đãi do nền tảng phát hành.'}
      adminLayout
      adminOwnerType={isInstructorTab ? 'INSTRUCTOR' : 'PLATFORM'}
      readOnly={isInstructorTab}
    />
  );
}
