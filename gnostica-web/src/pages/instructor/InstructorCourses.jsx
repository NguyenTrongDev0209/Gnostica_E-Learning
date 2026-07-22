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
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  MessageSquareWarning,
  Users,
  Star,
} from "lucide-react";
import AppCard, { AppCardContent } from "@/components/common/micro/AppCard";
import { AppButton, TableActionIconButton } from "@/components/common/micro/AppButton";
import AppInput from "@/components/common/micro/AppInput";
import { Select as AppSelectRoot, SelectContent as AppSelectContent, SelectItem as AppSelectItem, SelectTrigger as AppSelectTrigger, SelectValue as AppSelectValue } from "@/components/common/micro/AppSelect";
import { AppDialogRoot, AppDialogContent, AppDialogDescription, AppDialogFooter, AppDialogHeader, AppDialogTitle } from "@/components/common/micro/AppDialog";
import DataTable from "@/components/common/composite/DataTable";
import categoryService from "@/services/course/categoryService";
import DataFilter, { DataFilterPriceRange } from "@/components/common/composite/DataFilter";

const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

function InstructorCourseTable({
    courses,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
    onToggleStatus,
    onViewRejectReason,
}) {
    const columns = [
        {
            header: "STT",
            className: "w-[60px] text-center",
            cellClassName: "text-center font-sans",
            render: (row, index) => (
                <span className="text-sm font-bold text-muted-foreground tracking-tighter">
                    {(index + 1).toString().padStart(2, '0')}
                </span>
            ),
        },
        {
            header: "Khóa học",
            className: "text-center",
            render: (row) => (
                <div className="flex gap-4 items-center">
                    <div className="w-24 h-16 rounded-md overflow-hidden shrink-0 border border-border relative bg-muted flex items-center justify-center">
                        {row.thumbnail ? (
                            <img src={row.thumbnail} alt={row.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300">
                                <Search className="w-5 h-5 mb-0.5 opacity-20" />
                                <span className="text-[7px] font-bold uppercase tracking-tighter opacity-40">No Image</span>
                            </div>
                        )}
                        {row.isVirtualDraft && (
                            <div className="absolute inset-0 bg-warning/5 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-warning bg-warning/10 px-1 py-0.5 rounded uppercase tracking-wider">
                                    Nháp
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground line-clamp-2" title={row.title}>
                            {row.title || <span className="italic text-muted-foreground">Chưa đặt tên</span>}
                        </span>
                        {row.isVirtualDraft ? (
                            <span className="text-xs text-amber-600 font-medium mt-1">Bản nháp chưa lưu</span>
                        ) : (
                            <span className="text-xs text-muted-foreground font-medium mt-1">ID: #{row.id}</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: "Giá",
            className: "text-center",
            cellClassName: "text-center",
            render: (row) => (
                <div className="flex flex-col items-center gap-1">
                    {row.isVirtualDraft ? (
                        <span className="text-sm text-muted-foreground italic">—</span>
                    ) : row.discount > 0 ? (
                        <>
                            <span className="font-bold text-foreground leading-none">{formatPrice(row.salePrice)}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground line-through decoration-slate-300">
                                    {formatPrice(row.price)}
                                </span>
                                <span className="text-[9px] font-bold text-error bg-error/10 px-1 rounded">
                                    -{row.discount}%
                                </span>
                            </div>
                        </>
                    ) : (
                        <span className="font-bold text-foreground">{formatPrice(row.price)}</span>
                    )}
                </div>
            )
        },
        {
            header: "Danh mục",
            className: "text-center",
            cellClassName: "text-center",
            render: (row) => row.isVirtualDraft ? (
                <span className="text-slate-300 text-sm">—</span>
            ) : (
                <span className="inline-flex items-center gap-1.5 font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full text-xs border border-primary/20">
                    <Tag className="w-3 h-3" />
                    {row.categoryName || "Chưa phân loại"}
                </span>
            )
        },
        {
            header: "Thống kê",
            className: "text-center",
            render: (row) => row.isVirtualDraft ? (
                <div className="flex justify-center"><span className="text-slate-300 text-sm">—</span></div>
            ) : (
                <div className="flex justify-center gap-4 text-xs font-bold text-foreground">
                    <div className="flex flex-col items-center gap-1 bg-muted p-1.5 rounded-md border border-border min-w-[50px]">
                        <Users className="w-3.5 h-3.5 text-info" /> {row.students || 0}
                    </div>
                    <div className="flex flex-col items-center gap-1 bg-muted p-1.5 rounded-md border border-border min-w-[50px]">
                        <Star className="w-3.5 h-3.5 text-slate-300" /> --
                    </div>
                </div>
            )
        },
        {
            header: "Trạng thái",
            className: "text-center w-[120px]",
            cellClassName: "text-center",
            render: (row) => (
                <div className="flex justify-center flex-wrap gap-1">
                    {row.isVirtualDraft ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-warning font-bold bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20">
                            Bản nháp mới
                        </span>
                    ) : (
                        <>
                            {row.status === 1 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-success font-bold bg-success/10 px-1.5 py-0 rounded border border-success/20">Đang bán</span>
                            ) : row.status === 3 || row.status === "rejected" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-error font-bold bg-error/10 px-1.5 py-0 rounded border border-error/20">Bị từ chối</span>
                            ) : row.status === 4 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-warning font-bold bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20">Chờ duyệt</span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold bg-secondary px-1.5 py-0 rounded border border-border">Ẩn</span>
                            )}
                            {row.hasUnsavedDraft && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-warning font-bold bg-warning/10 px-1.5 py-0 rounded border border-warning/20">
                                    Có bản nháp
                                    <span className="w-1 h-1 rounded-full bg-warning text-warning animate-pulse ml-1" />
                                </span>
                            )}
                        </>
                    )}
                </div>
            )
        },
        {
            header: "Thao tác",
            className: "text-center",
            cellClassName: "text-center",
            render: (row) => (
                <div className="flex justify-center items-center gap-2">
                    {(!row.isVirtualDraft && (row.status === 1 || row.status === 2)) && (
                        <TableActionIconButton
                            icon={row.status === 1 ? Eye : EyeOff}
                            onClick={() => onToggleStatus?.(row.id, row.status)}
                            title={row.status === 1 ? "Đang hiển thị (Nhấn để ẩn)" : "Đang ẩn (Nhấn để hiện)"}
                        />
                    )}
                    {(row.status === 3 || row.status === "rejected") && (
                        <TableActionIconButton
                            icon={MessageSquareWarning}
                            colorVariant="error"
                            title="Xem lý do từ chối"
                            onClick={() => onViewRejectReason?.(row)}
                        />
                    )}
                    <TableActionIconButton
                        icon={Pencil}
                        onClick={() => onEdit?.(row)}
                        title="Chỉnh sửa"
                    />
                    <TableActionIconButton
                        icon={Trash2}
                        colorVariant="error"
                        onClick={() => onDelete?.(row)}
                        title="Xóa"
                    />
                </div>
            )
        }
    ];

    return (
        <DataTable 
            columns={columns} 
            data={courses} 
            pagination={{
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalElements: pagination.totalElements,
                onPageChange: onPageChange,
                zeroIndexed: true
            }}
            emptyState="Bạn chưa có khóa học nào."
            rowClassName={(row) => `hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 ${row.isVirtualDraft ? "bg-amber-50/40 border-l-2 border-l-amber-400" : ""}`}
        />
    );
}

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
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [statusFilters, setStatusFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  const filteredCourses = (courses || []).filter(course => {
    let matchDate = true;
    if (dateRange?.from) {
      const dateVal = course.createdAt || course.updatedAt;
      if (dateVal) {
        const itemDate = new Date(dateVal);
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = dateRange.to ? new Date(dateRange.to) : new Date(from);
        to.setHours(23, 59, 59, 999);
        matchDate = itemDate >= from && itemDate <= to;
      }
    }

    let matchCategory = true;
    if (filters.categoryId) {
      if (course.categoryId !== filters.categoryId) matchCategory = false;
    }
    
    let matchStatus = true;
    if (statusFilters.length > 0) {
      if (!statusFilters.includes(String(course.status))) matchStatus = false;
    }

    let matchSearch = true;
    if (localSearch) {
      if (!course.title?.toLowerCase().includes(localSearch.toLowerCase())) matchSearch = false;
    }

    let matchPrice = true;
    if (priceRange[0] > 0 || priceRange[1] < 10000000) {
      const coursePrice = course.price || 0;
      if (coursePrice < priceRange[0] || coursePrice > priceRange[1]) matchPrice = false;
    }

    return matchDate && matchCategory && matchStatus && matchSearch && matchPrice;
  });

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
    } else if (course.hasDraftVersion && course.draftCourseSlug) {
      navigate(`/instructor/courses/edit/${course.draftCourseSlug}`);
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">Khóa Học Của Tôi</h1>
          <p className="text-sm font-medium text-muted-foreground">
            Quản lý, chỉnh sửa và theo dõi hiệu suất các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <AppButton appVariant="gradient"
          onClick={() => navigate("/instructor/courses/courses-form")}
          className="btn-md font-bold rounded-xl transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4 mr-2" /> Tạo khóa học mới
        </AppButton>
      </div>

      {/* Stats Summary (Styled like Students page) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng khóa học", value: pagination.totalElements || 0, icon: PlayCircle, bgClass: "bg-info/10", textClass: "text-info", borderClass: "border-info/20", circleClass: "bg-info/5 group-hover:bg-info/10" },
          { label: "Đang hiển thị", value: courses.filter(c => c.status === 1).length, icon: CheckCircle2, bgClass: "bg-success/10", textClass: "text-success", borderClass: "border-success/20", circleClass: "bg-success/5 group-hover:bg-success/10" },
          { label: "Chờ duyệt", value: courses.filter(c => c.status === 4).length, icon: Clock, bgClass: "bg-warning/10", textClass: "text-warning", borderClass: "border-warning/20", circleClass: "bg-warning/5 group-hover:bg-warning/10" },
          { label: "Bản nháp", value: courses.filter(c => c.isVirtualDraft || c.hasUnsavedDraft).length, icon: Activity, bgClass: "bg-primary/10", textClass: "text-primary", borderClass: "border-primary/20", circleClass: "bg-primary/5 group-hover:bg-primary/10" },
        ].map((stat, i) => (
          <AppCard key={i} className="group hover-lift border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative rounded-2xl bg-card">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.circleClass} transition-colors duration-500`} />
            <AppCardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${stat.bgClass} flex items-center justify-center ${stat.textClass} border ${stat.borderClass} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                <span className="text-2xl font-semibold text-foreground tracking-tight">{stat.value}</span>
              </div>
            </AppCardContent>
          </AppCard>
        ))}
      </div>

      {/* Filters & Content */}
      <div className="space-y-6">
        <DataFilter
          searchQuery={localSearch}
          onSearchChange={setLocalSearch}
          searchPlaceholder="Tìm khóa học theo tên..."
          dropdownChecklists={[
            {
              title: "Bộ lọc",
              items: [
                { label: "Đang bán", value: "1" },
                { label: "Chờ duyệt", value: "4" },
                { label: "Ẩn", value: "2" }
              ],
              selectedItems: statusFilters,
              onItemToggle: (val) => setStatusFilters(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]),
              onClear: () => setStatusFilters([])
            }
          ]}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          dateRangePlaceholder="Khoảng thời gian"
        >
          <DataFilterPriceRange
            title="Khoảng giá"
            min={0}
            max={10000000}
            step={50000}
            value={priceRange}
            onValueChange={setPriceRange}
            onClear={() => setPriceRange([0, 10000000])}
          />
        </DataFilter>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-border shadow-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse">Đang tải danh sách khóa học...</p>
          </div>
        ) : (
          <InstructorCourseTable
            courses={filteredCourses}
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
      <AppDialogRoot
        open={rejectViewModal.isOpen}
        onOpenChange={(open) => setRejectViewModal(prev => ({ ...prev, isOpen: open }))}
      >
        <AppDialogContent className="sm:!max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-white rounded-2xl">
          <AppDialogHeader className="p-6 pb-4 bg-muted border-b border-border text-left sm:text-left flex flex-row items-start gap-4 space-y-0">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-error/10 flex items-center justify-center text-error border border-error/20 shadow-sm">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <AppDialogTitle className="text-lg font-bold text-foreground tracking-tight leading-tight uppercase">
                Lý do từ chối
              </AppDialogTitle>
              <AppDialogDescription className="text-muted-foreground text-xs font-bold leading-tight">
                Khóa học: <span className="text-error">"{rejectViewModal.courseTitle}"</span>
              </AppDialogDescription>
            </div>
          </AppDialogHeader>

          <div className="p-6 bg-white">
            <div className="p-5 bg-error/5 border border-error/20 rounded-2xl relative shadow-inner">
              <AlertCircle className="absolute top-4 right-4 w-4 h-4 text-error" />
              <p className="text-[10px] font-bold text-error uppercase tracking-widest mb-2 flex items-center gap-1.5">
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

          <AppDialogFooter className="p-4 bg-muted border-t border-border">
            <AppButton appVariant="gradient"
              onClick={() => setRejectViewModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full h-11 font-black rounded-xl"
            >
              Đã hiểu
            </AppButton>
          </AppDialogFooter>
        </AppDialogContent>
      </AppDialogRoot>
    </div>
  );
}
