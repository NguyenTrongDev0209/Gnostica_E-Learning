import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useInstructorCourses from "@/hooks/course/useInstructorCourses";
import {
  Plus,
  Search,
  PlayCircle,
  Loader2,
  XCircle,
  AlertCircle,
  Tag,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GhostButton, SimpleButton } from "@/components/common/AppButton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InstructorCourseTable from "@/pages/instructor/components/InstructorCourseTable";
import categoryService from "@/services/course/categoryService";

export default function InstructorCourses() {
  const navigate = useNavigate();
  const {
    courses,
    loading,
    pagination,
    fetchCourses,
    handleToggleStatus,
    handleDelete: performDelete,
    handleDeleteDraft: performDeleteDraft,
    filters,
    setFilters
  } = useInstructorCourses(10);

  // Local states for UI controls
  const [categories, setCategories] = useState([]);
  const [localSearch, setLocalSearch] = useState("");

  // 1. Load Categories for Dropdown
  useEffect(() => {
    categoryService.getAllCategories(1, 1000, "", "active")
      .then((res) => {
        const catList = res?.data?.content || [];
        const flattened = [];
        const parents = catList.filter(c => !c.parent);

        parents.forEach(p => {
          flattened.push({ id: p.id, name: p.name, isParent: true });
          const children = catList.filter(c => c.parent && c.parent.id === p.id);
          children.forEach(c => {
            flattened.push({ id: c.id, name: `↳ ${c.name}`, isParent: false });
          });
        });
        setCategories(flattened);
      })
      .catch(err => console.error("Error loading filter cats", err));
  }, []);

  // 2. Debounce Search Mechanism
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: localSearch }));
    }, 600);
    return () => clearTimeout(timer);
  }, [localSearch, setFilters]);

  // State logic to view rejection details
  const [rejectViewModal, setRejectViewModal] = useState({
    isOpen: false,
    courseTitle: "",
    reason: "",
  });

  const handleOpenRejectReason = (course) => {
    setRejectViewModal({
      isOpen: true,
      courseTitle: course.title,
      reason: course.rejectReason || "Không có nội dung lý do chi tiết đính kèm.",
    });
  };

  const handleEdit = (course) => {
    if (course.isVirtualDraft) {
      navigate("/instructor/courses/edit/new");
    } else {
      navigate(`/instructor/courses/edit/${course.slug}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < (pagination.totalPages || 1)) {
      fetchCourses(newPage);
    }
  };

  return (
    <div className="py-8 space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-h1 font-black text-foreground tracking-tight leading-none">Khóa Học Của Tôi</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Quản lý, chỉnh sửa và theo dõi hiệu suất các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <SimpleButton
          onClick={() => navigate("/instructor/courses/courses-form")}
          className="btn-md font-bold rounded-xl transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 mr-2" /> Tạo khóa học mới
        </SimpleButton>
      </div>

      {/* Stats Summary (Styled like Students page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng khóa học", value: pagination.totalElements || 0, icon: PlayCircle, color: "blue" },
          { label: "Đang hiển thị", value: courses.filter(c => c.status === 1).length, icon: CheckCircle2, color: "green" },
          { label: "Chờ duyệt", value: courses.filter(c => c.status === 4).length, icon: Clock, color: "amber" },
          { label: "Bản nháp", value: courses.filter(c => c.isVirtualDraft || c.hasUnsavedDraft).length, icon: Activity, color: "purple" },
        ].map((stat, i) => (
          <Card key={i} className="group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-${stat.color}-50/50 group-hover:bg-${stat.color}-100/50 transition-colors duration-500`} />
            <CardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 border border-${stat.color}-100 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <span className="text-2xl font-black text-foreground tracking-tight">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Content */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl border border-border">
          <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-3">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Tìm khóa học theo tên..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 h-11 bg-white border-border focus:ring-2 focus:ring-primary/10 transition-all rounded-xl shadow-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-muted/80 p-1 rounded-xl w-full sm:w-auto border border-border/50">
              <Select
                value={filters.categoryId ? String(filters.categoryId) : "all"}
                onValueChange={(val) => setFilters(prev => ({ ...prev, categoryId: val === "all" ? null : Number(val) }))}
              >
                <SelectTrigger className="h-9 w-full sm:w-[200px] bg-transparent border-none focus:ring-0 text-sm font-bold text-foreground cursor-pointer">
                  <div className="flex items-center gap-2 truncate">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Tất cả danh mục" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] rounded-xl border-border">
                  <SelectItem value="all" className="font-bold">Tất cả danh mục</SelectItem>
                  {categories.map(cat => (
                    <SelectItem
                      key={cat.id}
                      value={String(cat.id)}
                      className={cat.isParent ? "font-extrabold bg-muted" : "pl-6 font-medium"}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground bg-muted/80 p-1.5 rounded-xl border border-border/50 shadow-inner">
            {[
              { label: "Tất cả", value: "all" },
              { label: "Đang bán", value: "1" },
              { label: "Chờ duyệt", value: "4" },
              { label: "Ẩn", value: "2" }
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilters(prev => ({ ...prev, status: btn.value === "all" ? "" : Number(btn.value) }))}
                className={`px-5 py-2 rounded-lg transition-all font-black uppercase tracking-tight ${(filters.status === "" && btn.value === "all") || (String(filters.status) === btn.value)
                    ? "bg-white text-primary shadow-sm"
                    : "hover:text-foreground hover:bg-white/50"
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-border shadow-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải danh sách khóa học...</p>
          </div>
        ) : (
          <InstructorCourseTable
            courses={courses}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={(course) => {
              if (course.isVirtualDraft) {
                performDeleteDraft(course);
              } else {
                performDelete(course.id, course.title);
              }
            }}
            onToggleStatus={handleToggleStatus}
            onViewRejectReason={handleOpenRejectReason}
          />
        )}
      </div>

      {/* REJECTION REASON VIEWER MODAL (Styled like Students details) */}
      <Dialog
        open={rejectViewModal.isOpen}
        onOpenChange={(open) => setRejectViewModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:!max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-2xl">
          <DialogHeader className="p-6 pb-4 bg-muted border-b border-border text-left sm:text-left flex flex-row items-start gap-4 space-y-0">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-black text-foreground tracking-tight leading-tight uppercase">
                Lý do từ chối
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs font-bold leading-tight">
                Khóa học: <span className="text-rose-600">"{rejectViewModal.courseTitle}"</span>
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 bg-white">
            <div className="p-5 bg-rose-50/50 border border-rose-100 rounded-2xl relative shadow-inner">
              <AlertCircle className="absolute top-4 right-4 w-4 h-4 text-rose-300" />
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                Phản hồi từ Quản trị viên
              </p>
              <p className="text-foreground font-bold text-sm leading-relaxed whitespace-pre-wrap italic">
                "{rejectViewModal.reason}"
              </p>
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-bold flex items-start gap-1.5 leading-relaxed bg-muted p-3 rounded-xl border border-border">
              <span className="shrink-0 text-amber-500">💡</span> Vui lòng cập nhật lại nội dung theo yêu cầu để gửi kiểm duyệt lại.
            </p>
          </div>

          <DialogFooter className="p-4 bg-muted border-t border-border">
            <SimpleButton
              onClick={() => setRejectViewModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full h-11 font-black rounded-xl"
            >
              Đã hiểu
            </SimpleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
