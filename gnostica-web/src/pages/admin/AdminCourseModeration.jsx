import { format } from "date-fns";
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Search,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Filter,
  ArrowUpRight,
  MoreVertical,
  Calendar,
  Loader2, ShieldCheck} from "lucide-react";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import DataTable from "@/components/common/composite/DataTable";
import { AppButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import AppBadge from "@/components/common/micro/AppBadge";
import {
  AppDropdownMenuRoot as DropdownMenu,
  AppDropdownMenuContent as DropdownMenuContent,
  AppDropdownMenuItem as DropdownMenuItem,
  AppDropdownMenuTrigger as DropdownMenuTrigger,
} from "@/components/common/micro/AppDropdownMenu";
// eslint-disable-next-line no-unused-vars
import courseService from "@/services/course/courseService";


// Shared Modal Imports
import CourseRejectModal from "@/components/modals/CourseRejectModal";
import InstructorProfileModal from "@/components/modals/InstructorProfileModal";

import useAdminCourseModeration from "@/hooks/course/useAdminCourseModeration";

export default function AdminCourseModeration() {
  const navigate = useNavigate();

  const {
    activeTab,
    setActiveTab,
    courses,
    loading,
    pagination,
    searchTerm,
    setSearchTerm,
    stats,
    loadCourses,
    isRejectModalOpen,
    setIsRejectModalOpen,
    selectedCourse,
    rejectReason,
    setRejectReason,
    isProfileModalOpen,
    setIsProfileModalOpen,
    activeInstructor,
    handleApprove,
    handleOpenRejectModal,
    handleConfirmReject,
    handleOpenInstructorProfile,
    formatFriendlyDate,
    isSubmitting
  } = useAdminCourseModeration();

  const handleOpenPreview = (course) => {
    navigate(`/admin/course-moderation/${course.slug}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 4: // Backend Chờ duyệt
        return <AppBadge variant="warning" soft icon={Clock}>Chờ duyệt</AppBadge>;
      case 1: // Backend Đã duyệt
        return <AppBadge variant="success" soft icon={CheckCircle2}>Đã duyệt</AppBadge>;
      case 3: // Backend Từ chối
        return <AppBadge variant="error" soft icon={XCircle}>Từ chối</AppBadge>;
      case 2: // Backend Ẩn
        return <AppBadge variant="secondary" soft icon={Clock}>Tạm ẩn</AppBadge>;
      default:
        return <AppBadge variant="secondary" soft>Nháp</AppBadge>;
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredCourses = courses;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-border/60 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Kiểm Duyệt Khóa Học
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem xét, phê duyệt hoặc từ chối các khóa học mới từ giảng viên.
        </p>
        </div>
      </div>

      {/* Status Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-white to-amber-50/20 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Đang chờ phê duyệt
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-amber-700">{stats.pending}</span>
            <AppBadge variant="warning" soft>Cần duyệt</AppBadge>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-white to-emerald-50/20 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Đã phê duyệt
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-emerald-700">{stats.approved}</span>
            <AppBadge variant="success" soft>Hoạt động</AppBadge>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-white to-rose-50/20 border border-border rounded-xl shadow-sm">
          <h4 className="text-sm font-bold text-muted-foreground tracking-wide uppercase mb-1">
            Đã từ chối duyệt
          </h4>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-black text-rose-700">{stats.rejected}</span>
            <AppBadge variant="error" soft>Yêu cầu sửa</AppBadge>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-border/60 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex w-full lg:w-auto items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <AppInput
              placeholder="Tìm nhanh trong trang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-muted border-border h-10 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-xl w-full lg:w-auto border border-border/30">
          <TabButton
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            Tất cả
          </TabButton>
          <TabButton
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
          >
            Đang chờ
          </TabButton>
          <TabButton
            active={activeTab === "approved"}
            onClick={() => setActiveTab("approved")}
          >
            Đã duyệt
          </TabButton>
          <TabButton
            active={activeTab === "rejected"}
            onClick={() => setActiveTab("rejected")}
          >
            Từ chối
          </TabButton>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
          columns={[
            {
              header: "Thông tin khóa học",
              className: "pl-6 min-w-[300px]",
              render: (item) => (
                <div className="flex gap-4 items-center pl-6">
                  <div
                    onClick={() => handleOpenPreview(item)}
                    className="w-24 h-16 rounded-lg overflow-hidden border border-border shadow-sm shrink-0 relative group-hover:shadow-md transition-shadow cursor-pointer bg-secondary flex items-center justify-center"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-[8px] font-extrabold text-muted-foreground">Gnostica Image</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="w-5 h-5 text-white drop-shadow" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      onClick={() => handleOpenPreview(item)}
                      className="font-bold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer leading-tight"
                      title={item.title}
                    >
                      {item.title || <i className="text-muted-foreground font-normal">Chưa đặt tên</i>}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <AppBadge variant="outline" className="text-[10px] font-extrabold uppercase tracking-wide px-1 bg-transparent border-transparent text-muted-foreground opacity-50">
                        ID: {item.id}
                      </AppBadge>
                      {item.isVersionUpdate && (
                        <AppBadge className="text-[9px] font-black uppercase bg-blue-100 text-blue-700 border border-blue-200">
                          Bản cập nhật v2
                        </AppBadge>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Danh mục",
              align: "center",
              render: (item) => (
                <span className="text-sm font-semibold text-foreground">
                  {item.categoryName || "Chưa rõ danh mục"}
                </span>
              ),
            },
            {
              header: "Giảng viên",
              align: "center",
              render: (item) => (
                <div className="flex items-center justify-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-secondary shadow-sm shrink-0 flex items-center justify-center">
                    {item.instructorAvatar ? (
                      <img
                        src={item.instructorAvatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">Gv</span>
                    )}
                  </div>
                  <span className="font-semibold text-foreground text-sm line-clamp-1">
                    {item.instructorName || "Unknown"}
                  </span>
                </div>
              ),
            },
            {
              header: "Ngày cập nhật",
              align: "center",
              render: (item) => (
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-sm font-medium">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatFriendlyDate(item.updatedAt)}
                </div>
              ),
            },
            {
              header: "Giá bán",
              align: "center",
              render: (item) => (
                <span className="font-extrabold text-foreground text-[15px]">
                  {formatCurrency(item.salePrice || item.price || 0)}
                </span>
              ),
            },
            {
              header: "Trạng thái",
              align: "center",
              render: (item) => getStatusBadge(item.status),
            },
            {
              header: "Thao tác",
              className: "text-right pr-6",
              render: (item) => (
                <div className="flex justify-end items-center gap-2 pr-6">
                  {item.status === 4 ? (
                    <>
                      <AppButton appVariant="gradient"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleApprove(item)}
                        className="h-8 font-bold gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 border-none"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Duyệt
                      </AppButton>
                      <AppButton appVariant="ghostMuted" variant="ghost"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleOpenRejectModal(item)}
                        className="h-8 font-bold border border-border text-muted-foreground hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                      >
                        Từ chối
                      </AppButton>
                    </>
                  ) : (
                    <AppButton appVariant="ghostMuted" variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPreview(item)}
                      className="h-8 font-bold text-muted-foreground gap-1.5 hover:border-primary hover:text-primary bg-white border border-border"
                    >
                      Chi tiết <ArrowUpRight className="w-3.5 h-3.5" />
                    </AppButton>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <AppButton appVariant="ghostMuted" variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full border-none hover:bg-muted"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </AppButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={() => handleOpenPreview(item)}
                        className="cursor-pointer font-semibold"
                      >
                        Xem giáo trình đầy đủ
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenInstructorProfile(item)}
                        className="cursor-pointer font-semibold"
                      >
                        Hồ sơ Giảng viên
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            },
          ]}
          data={filteredCourses}
          isLoading={loading}
          loadingState="Đang tải danh sách kiểm duyệt..."
          emptyState="Danh sách kiểm duyệt đang trống"
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages || 1,
            totalElements: pagination.totalElements,
            onPageChange: (page) => loadCourses(page),
            zeroIndexed: true,
          }}
        />

      <CourseRejectModal
         isOpen={isRejectModalOpen}
         onClose={setIsRejectModalOpen}
         courseName={selectedCourse?.title}
         rejectReason={rejectReason}
         setRejectReason={setRejectReason}
         onConfirm={handleConfirmReject}
      />

      <InstructorProfileModal 
         isOpen={isProfileModalOpen}
         onClose={setIsProfileModalOpen}
         instructor={activeInstructor}
      />
    </div>
  );
}

const TabButton = ({ children, active, onClick }) => (
  <AppButton
    appVariant="ghostMuted"
    variant="ghost"
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 text-center h-auto
      ${
        active
          ? "bg-white text-foreground shadow-sm border border-border/50 scale-[1.02]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
      }
    `}
  >
    {children}
  </AppButton>
);
