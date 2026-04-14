import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Star,
  Users,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import courseService from "@/services/courseService";
import { toast } from "sonner";

export default function InstructorCourses() {
  const navigate = useNavigate();
  const {
    courses,
    loading,
    searchTerm,
    setSearchTerm,
    pagination,
    fetchCourses,
    handleToggleStatus,
    handleDelete: performDelete,
    handleDeleteDraft: performDeleteDraft,
  } = useInstructorCourses(10);

  const handleDeleteDraft = async (course) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản nháp này? Dữ liệu chưa lưu sẽ bị mất vĩnh viễn.")) return;
    
    try {
      let courseId = null;
      let slug = null;

      if (course.isVirtualDraft) {
        // Bản nháp ảo (chưa có trong DB): dùng slug nếu có
        const rawSlug = String(course.id).replace('draft-', '');
        slug = rawSlug === 'new' ? null : rawSlug;
      } else {
        // Bản nháp của khóa học đã có trong DB: dùng courseId
        courseId = String(course.id);
      }

      await courseService.deleteDraft({ courseId, slug });
      toast.success("Đã xóa bản nháp");
      fetchCourses(pagination.currentPage);
    } catch (error) {
      console.error("Lỗi xóa bản nháp:", error);
      toast.error("Không thể xóa bản nháp");
    }
  };

  const handleEdit = (course) => {
    if (course.isVirtualDraft) {
      // Nếu là bản nháp mới hoàn toàn
      navigate("/instructor/courses/edit/new");
    } else {
      // Nếu là khóa học đã có trong DB (có thể kèm bản nháp chưa lưu)
      navigate(`/instructor/courses/edit/${course.slug}`);
    }
  };

  const handleToggleStatus = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 2 : 1; // 1: Active, 2: Hidden
      await courseService.updateCourseStatus(courseId, newStatus);
      toast.success(newStatus === 1 ? "Đã hiển thị khóa học" : "Đã ẩn khóa học");
      
      // Update local state for "real-time" feel
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, status: newStatus } : c
      ));
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái:", error);
      toast.error("Không thể thay đổi trạng thái khóa học");
    }
  };

  const handleDelete = async (courseId, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"? Thao tác này sẽ xóa toàn bộ nội dung liên quan và không thể khôi phục.`)) {
      try {
        await courseService.deleteCourse(courseId);
        toast.success("Đã xóa khóa học thành công");
        fetchCourses(pagination.currentPage); // Refresh current page
      } catch (error) {
        console.error("Lỗi khi xóa khóa học:", error);
        toast.error("Không thể xóa khóa học này");
      }
    }
  };

  useEffect(() => {
    fetchCourses(0);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchCourses(newPage);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Khóa Học Của Tôi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý, chỉnh sửa và theo dõi hiệu suất các khóa học bạn đang giảng dạy.
          </p>
        </div>
        <Button
          onClick={() => navigate("/instructor/courses/courses-form")}
          className="h-9 font-bold bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 shadow-none hidden lg:flex"
        >
          <Plus className="w-4 h-4" />
          Tạo khóa học mới
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-80 border-slate-200">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm khóa học theo tên..."
                className="pl-9 h-10 border-slate-200 focus:bg-white focus:border-green-500 focus:ring-green-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex text-sm font-medium text-slate-500 bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-white text-slate-900 shadow-sm">Tất cả ({pagination.totalElements})</button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="py-4 font-semibold text-slate-700 w-[400px]">Khóa học</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700">Giá & Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Nội dung</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center">Thống kê</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-center w-[120px]">Trạng thái</TableHead>
                <TableHead className="py-4 font-semibold text-slate-700 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Bạn chưa có khóa học nào.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow 
                    key={course.id} 
                    className={`hover:bg-slate-50/50 transition-colors ${
                      course.isVirtualDraft ? 'bg-amber-50/40 border-l-2 border-l-amber-400' : ''
                    }`}
                  >
                    <TableCell>
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-16 rounded-md overflow-hidden shrink-0 border border-slate-200 relative bg-slate-50 flex items-center justify-center">
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300">
                              <Search className="w-5 h-5 mb-0.5 opacity-20" />
                              <span className="text-[7px] font-bold uppercase tracking-tighter opacity-40">No Image</span>
                            </div>
                          )}
                          
                          {course.isVirtualDraft && (
                            <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                              <span className="text-[8px] font-black text-amber-700 bg-amber-100/90 px-1 py-0.5 rounded uppercase tracking-wider">
                                Nháp
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 line-clamp-2" title={course.title}>
                            {course.title || <span className="italic text-slate-400">Chưa đặt tên</span>}
                          </span>
                          {course.isVirtualDraft ? (
                            <span className="text-xs text-amber-600 font-medium mt-1">Bản nháp chưa lưu</span>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium mt-1">ID: #{course.id}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {course.isVirtualDraft ? (
                          // Bản nháp ảo: không hiển thị giá thực, chỉ hiển thị trạng thái
                          <span className="text-sm text-slate-400 italic">—</span>
                        ) : course.discount > 0 ? (
                          <>
                            <span className="font-black text-slate-900 leading-none">
                              {formatPrice(course.salePrice)}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 line-through decoration-slate-300">
                                {formatPrice(course.price)}
                              </span>
                              <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1 rounded">
                                -{course.discount}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="font-black text-slate-900">
                            {formatPrice(course.price)}
                          </span>
                        )}
                        
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {course.isVirtualDraft ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                              ✏️ Bản nháp mới
                            </span>
                          ) : (
                            <>
                              {course.status === 1 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0 rounded border border-green-200">
                                   Đang bán
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-bold bg-slate-100 px-1.5 py-0 rounded border border-slate-200">
                                   Ẩn
                                </span>
                              )}
                              {course.hasUnsavedDraft && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0 rounded border border-orange-200">
                                  Có bản nháp
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {course.isVirtualDraft ? (
                        <span className="text-slate-300 text-sm">—</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md text-xs border border-slate-200">
                          <PlayCircle className="w-3.5 h-3.5 text-slate-500" />
                          {course.modules?.length || 0} chương học
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {course.isVirtualDraft ? (
                        <div className="flex justify-center">
                          <span className="text-slate-300 text-sm">—</span>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-4 text-xs font-bold text-slate-700">
                          <div className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded-md border border-slate-100 min-w-[50px]">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            0
                          </div>
                          <div className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded-md border border-slate-100 min-w-[50px]">
                            <Star className="w-3.5 h-3.5 text-slate-300" />
                            --
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {!course.isVirtualDraft && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-9 w-9 rounded-lg transition-all mx-auto ${
                            course.status === 1 
                              ? "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
                          }`}
                          onClick={() => handleToggleStatus(course.id, course.status)}
                          title={course.status === 1 ? "Khóa học đang hiển thị (Nhấn để ẩn)" : "Khóa học đang ẩn (Nhấn để hiện)"}
                        >
                          {course.status === 1 ? <Eye className="w-4.5 h-4.5" /> : <EyeOff className="w-4.5 h-4.5" />}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-bold rounded-lg transition-all"
                          onClick={() => handleEdit(course)}
                        >
                          Chỉnh sửa
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-all"
                          onClick={() => {
                            if (course.isVirtualDraft) {
                              handleDeleteDraft(course);
                            } else {
                              handleDelete(course.id, course.title);
                            }
                          }}
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Improved Pagination Controls */}
        <div className="px-4 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500 font-medium">
            Hiển thị trang <span className="text-slate-900">{pagination.currentPage + 1}</span> / <span className="text-slate-900">{pagination.totalPages || 1}</span> (Tổng {pagination.totalElements} khóa học)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage === 0 || loading}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="h-9 px-3 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Trước
            </Button>
            <div className="flex gap-1">
              {[...Array(pagination.totalPages)].map((_, idx) => (
                <Button
                  key={idx}
                  variant={pagination.currentPage === idx ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(idx)}
                  className={`h-9 w-9 p-0 ${pagination.currentPage === idx ? "bg-green-600 hover:bg-green-700" : "border-slate-200"}`}
                >
                  {idx + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.currentPage >= pagination.totalPages - 1 || loading}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              className="h-9 px-3 border-slate-200 hover:bg-slate-50 disabled:opacity-50"
            >
              Sau <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
