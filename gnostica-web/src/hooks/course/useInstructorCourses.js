import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import courseService from "@/services/course/courseService";
import { USE_INSTRUCTOR_MOCK, MOCK_COURSES } from "@/mocks/instructorMockData";

/**
 * Hook quản lý danh sách khóa học của giảng viên bằng React Query.
 */
export default function useInstructorCourses(pageSize = 10) {
  const queryClient = useQueryClient();
  
  const [paginationState, setPaginationState] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: pageSize
  });

  const [filters, setFilters] = useState({
    search: "",
    categoryId: null,
    status: ""
  });

  const { data, isLoading: loading } = useQuery({
    queryKey: ['instructor_courses', paginationState.currentPage, filters],
    queryFn: async () => {
      let dbData = {};
      let drafts = [];
      try {
        const response = await courseService.getInstructorCourses(
          paginationState.currentPage, 
          paginationState.size, 
          filters.search, 
          filters.categoryId, 
          filters.status
        );
        const draftsRaw = await courseService.getAllDrafts();
        dbData = (response && response.data !== undefined && response.error !== undefined) ? response.data : response;
        drafts = (draftsRaw && draftsRaw.data && draftsRaw.error !== undefined) ? draftsRaw.data : draftsRaw;
      } catch (e) {
        if (USE_INSTRUCTOR_MOCK) {
          console.log("Using Mock Data for Courses due to error");
          dbData = MOCK_COURSES;
        } else {
          throw e;
        }
      }

      if (USE_INSTRUCTOR_MOCK && (!dbData || !dbData.content || dbData.content.length === 0) && (!drafts || drafts.length === 0)) {
        dbData = MOCK_COURSES;
      }

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
          else if (paginationState.currentPage === 0) {
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

      return {
        courses: dbCourses,
        currentPage: dbData.number || 0,
        totalPages: dbData.totalPages || 0,
        totalElements: dbData.totalElements || 0,
      };
    },
    staleTime: 1000 * 60 * 1, // Cache 1 minute
  });

  const courses = data?.courses || [];
  const pagination = {
    ...paginationState,
    currentPage: data?.currentPage ?? paginationState.currentPage,
    totalPages: data?.totalPages ?? paginationState.totalPages,
    totalElements: data?.totalElements ?? paginationState.totalElements,
  };

  const fetchCourses = (page = 0) => {
    setPaginationState(prev => ({ ...prev, currentPage: page }));
  };

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ courseId, newStatus }) => {
      return await courseService.updateCourseStatus(courseId, newStatus);
    },
    onSuccess: (res, variables) => {
      toast.success(variables.newStatus === 1 ? "Đã hiển thị khóa học" : "Đã ẩn khóa học");
      queryClient.invalidateQueries({ queryKey: ['instructor_courses'] });
    },
    onError: () => {
      toast.error("Không thể thay đổi trạng thái khóa học");
    }
  });

  const handleToggleStatus = async (courseId, currentStatus) => {
    const newStatus = currentStatus === 1 ? 2 : 1;
    await toggleStatusMutation.mutateAsync({ courseId, newStatus });
    return true;
  };

  const deleteMutation = useMutation({
    mutationFn: async (courseId) => {
      return await courseService.deleteCourse(courseId);
    },
    onSuccess: () => {
      toast.success("Đã xóa khóa học thành công");
      queryClient.invalidateQueries({ queryKey: ['instructor_courses'] });
    },
    onError: () => {
      toast.error("Không thể xóa khóa học này");
    }
  });

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"? Khóa học sẽ bị ẩn khỏi mọi học viên mới, nhưng những học viên đã mua vẫn có thể tiếp tục học nội dung này.`)) {
      return false;
    }
    await deleteMutation.mutateAsync(courseId);
    return true;
  };

  const deleteDraftMutation = useMutation({
    mutationFn: async ({ courseId, slug }) => {
      return await courseService.deleteDraft({ courseId, slug });
    },
    onSuccess: () => {
      toast.success("Đã xóa bản nháp");
      queryClient.invalidateQueries({ queryKey: ['instructor_courses'] });
    },
    onError: () => {
      toast.error("Không thể xóa bản nháp");
    }
  });

  const handleDeleteDraft = async (course) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản nháp này? Dữ liệu chưa lưu sẽ bị mất vĩnh viễn.")) return false;
    
    let courseId = null;
    let slug = null;

    if (course.isVirtualDraft) {
      const rawSlug = String(course.id).replace('draft-', '');
      slug = rawSlug === 'new' ? null : rawSlug;
    } else {
      courseId = String(course.id);
    }

    await deleteDraftMutation.mutateAsync({ courseId, slug });
    return true;
  };

  return {
    courses,
    loading,
    pagination,
    fetchCourses,
    handleToggleStatus,
    handleDelete,
    handleDeleteDraft,
    filters,
    setFilters
  };
}
