import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminCourseService from "@/services/admin/adminCourseService";
import { toast } from "sonner";

export default function useAdminCourseModeration() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeInstructor, setActiveInstructor] = useState(null);

  const extractPageData = (res) => {
    if (!res) return null;
    if (res.data !== undefined) return res.data;
    return res;
  };

  const { data: pageData, isLoading: loading } = useQuery({
    queryKey: ['admin_moderation_courses', activeTab, pagination.currentPage],
    queryFn: async () => {
      let statusParam = null;
      if (activeTab === "pending") statusParam = 4;
      else if (activeTab === "approved") statusParam = 1;
      else if (activeTab === "rejected") statusParam = 3;

      const resRaw = await adminCourseService.getModerationCourses(statusParam, pagination.currentPage, 10);
      return extractPageData(resRaw) || {};
    },
    staleTime: 1000 * 60,
  });

  const courses = pageData?.content || [];
  const currentPagination = {
    currentPage: pageData?.number || 0,
    totalPages: pageData?.totalPages || 0,
    totalElements: pageData?.totalElements || 0,
  };

  const { data: stats = { pending: 0, approved: 0, rejected: 0 } } = useQuery({
    queryKey: ['admin_moderation_stats'],
    queryFn: async () => {
      const res = await adminCourseService.getModerationStats();
      const statsData = res?.data !== undefined ? res.data : res;
      return {
        pending: statsData?.pending || 0,
        approved: statsData?.approved || 0,
        rejected: statsData?.rejected || 0,
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  const loadCourses = (page = 0) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const approveMutation = useMutation({
    mutationFn: async (slug) => {
      return await adminCourseService.approveCourse(slug);
    },
    onSuccess: () => {
      toast.success("Phê duyệt và xuất bản khóa học thành công!");
      queryClient.invalidateQueries({ queryKey: ['admin_moderation_courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin_moderation_stats'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Không thể phê duyệt khóa học này.");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ slug, reason }) => {
      return await adminCourseService.rejectCourse(slug, reason);
    },
    onSuccess: () => {
      toast.success("Đã gửi lý do từ chối phê duyệt khóa học.");
      setIsRejectModalOpen(false);
      setSelectedCourse(null);
      queryClient.invalidateQueries({ queryKey: ['admin_moderation_courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin_moderation_stats'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Lỗi khi từ chối khóa học.");
    }
  });

  const handleApprove = async (course) => {
    if (!window.confirm(`Bạn có chắc chắn phê duyệt công khai khóa học "${course.title}"?`)) return;
    await approveMutation.mutateAsync(course.slug);
  };

  const handleOpenRejectModal = (course) => {
    setSelectedCourse(course);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Vui lòng điền lý do từ chối kiểm duyệt.");
      return;
    }
    await rejectMutation.mutateAsync({ slug: selectedCourse.slug, reason: rejectReason });
  };

  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleOpenInstructorProfile = (course) => {
    if (!course.instructorId && !course.instructorName) return;
    setActiveInstructor({
       name: course.instructorName || "Chưa cập nhật",
       avatar: course.instructorAvatar,
       email: course.instructorEmail || "---",
       phone: course.instructorPhone || "---",
       cccd: "---",
       address: "Việt Nam",
       joinedDate: formatFriendlyDate(course.instructorCreatedAt),
       job: "Giảng viên Gnostica",
       bio: "Thông tin chi tiết về kinh nghiệm giảng dạy của tác giả khóa học.",
       bankName: "Ngân hàng liên kết",
       bankNumber: "---",
       bankHolder: (course.instructorName || "").toUpperCase(),
       courses: 1,
       students: "--",
       rating: "4.8"
    });
    setIsProfileModalOpen(true);
 };

  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    activeTab,
    setActiveTab,
    courses: filteredCourses,
    loading,
    pagination: currentPagination,
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
    
    isSubmitting: approveMutation.isPending || rejectMutation.isPending
  };
}
