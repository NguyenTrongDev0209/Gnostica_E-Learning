import { useState, useEffect } from "react";
import { toast } from "sonner";
import courseService from "@/services/courseService";

/**
 * Hook quản lý danh sách khóa học của giảng viên.
 * Bao gồm: Lấy dữ liệu (DB + Drafts), Gộp bản nháp, CRUD operations.
 */
export default function useInstructorCourses(pageSize = 10) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: pageSize
  });

  const fetchCourses = async (page = 0) => {
    try {
      setLoading(true);
      const response = await courseService.getInstructorCourses(page, pagination.size);
      const draftsRaw = await courseService.getAllDrafts();
      
      const dbData = (response && response.data !== undefined && response.error !== undefined) 
        ? response.data 
        : response;

      const drafts = (draftsRaw && draftsRaw.data && draftsRaw.error !== undefined)
        ? draftsRaw.data
        : draftsRaw;

      let dbCourses = dbData.content || [];

      // Logic Gộp Bản Nháp
      if (Array.isArray(drafts)) {
        drafts.forEach(draft => {
          if (draft.id && draft.id !== "new") {
            const courseInDb = dbCourses.find(c => String(c.id) === String(draft.id));
            if (courseInDb) {
              courseInDb.hasUnsavedDraft = true;
              if (draft.title) courseInDb.title = draft.title;
              if (draft.thumbnail) courseInDb.thumbnail = draft.thumbnail;
            }
          } 
          else if (page === 0) {
            const virtualDraft = {
              ...draft,
              id: `draft-${draft.slug || 'new'}`,
              isVirtualDraft: true,
              status: 0, 
            };
            dbCourses = [virtualDraft, ...dbCourses];
          }
        });
      }

      setCourses(dbCourses);
      setPagination(prev => ({
        ...prev,
        currentPage: dbData.number || 0,
        totalPages: dbData.totalPages || 0,
        totalElements: dbData.totalElements || 0,
      }));
    } catch (error) {
      console.error("Lỗi khi tải danh sách khóa học:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(0);
  }, []);

  const handleToggleStatus = async (courseId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 2 : 1; 
      await courseService.updateCourseStatus(courseId, newStatus);
      toast.success(newStatus === 1 ? "Đã hiển thị khóa học" : "Đã ẩn khóa học");
      
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, status: newStatus } : c
      ));
      return true;
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái:", error);
      toast.error("Không thể thay đổi trạng thái khóa học");
      return false;
    }
  };

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"? Thao tác này sẽ xóa toàn bộ nội dung liên quan và không thể khôi phục.`)) {
      return false;
    }
    
    try {
      await courseService.deleteCourse(courseId);
      toast.success("Đã xóa khóa học thành công");
      fetchCourses(pagination.currentPage);
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa khóa học:", error);
      toast.error("Không thể xóa khóa học này");
      return false;
    }
  };

  const handleDeleteDraft = async (course) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản nháp này? Dữ liệu chưa lưu sẽ bị mất vĩnh viễn.")) return false;
    
    try {
      let courseId = null;
      let slug = null;

      if (course.isVirtualDraft) {
        const rawSlug = String(course.id).replace('draft-', '');
        slug = rawSlug === 'new' ? null : rawSlug;
      } else {
        courseId = String(course.id);
      }

      await courseService.deleteDraft({ courseId, slug });
      toast.success("Đã xóa bản nháp");
      fetchCourses(pagination.currentPage);
      return true;
    } catch (error) {
      console.error("Lỗi xóa bản nháp:", error);
      toast.error("Không thể xóa bản nháp");
      return false;
    }
  };

  return {
    courses,
    loading,
    pagination,
    fetchCourses,
    handleToggleStatus,
    handleDelete,
    handleDeleteDraft
  };
}
