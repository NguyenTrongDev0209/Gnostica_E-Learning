import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ChevronRight } from "lucide-react";
import { SimpleButton } from "@/components/common/AppButton";
import useAuthStore from "@/store/useAuthStore";
import AccountWelcomeBanner from "@/pages/account/components/AccountWelcomeBanner";
import AccountStatsCards from "@/pages/account/components/AccountStatsCards";
import RecentCoursesList from "@/pages/account/components/RecentCoursesList";
import RecentCertificatesList from "@/pages/account/components/RecentCertificatesList";
import useAccountOverview from "@/hooks/user/useAccountOverview";

export default function AccountOverview() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const isInstructor = (user?.role || '').toUpperCase() === 'INSTRUCTOR';

  const { stats, recentCourses, recentCertificates, loading } = useAccountOverview();

  const handleBecomeInstructor = () => {
    navigate('/apply-instructor');
  };

  return (
    <div>
      <AppBreadcrumb paths={[{ label: "Tài khoản", href: "/account" }, { label: "Tổng quan" }]} />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">Tổng quan học tập</h1>
        <Link to="/courses">
          <SimpleButton className="w-full sm:w-auto font-bold gap-2">
            Khám phá khóa học mới
          </SimpleButton>
        </Link>
      </div>

      <AccountWelcomeBanner 
        user={user} 
        isInstructor={isInstructor} 
        handleBecomeInstructor={handleBecomeInstructor} 
      />

      <AccountStatsCards stats={stats} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Tiếp tục học tập</h2>
            <Link to="/account/my-courses" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <RecentCoursesList loading={loading} recentCourses={recentCourses} />
        </div>

        {/* Right Column: Certificates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Chứng chỉ mới nhất</h2>
            <Link to="/account/certificates" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <RecentCertificatesList loading={loading} recentCertificates={recentCertificates} />
        </div>
        
      </div>
    </div>
  );
}
