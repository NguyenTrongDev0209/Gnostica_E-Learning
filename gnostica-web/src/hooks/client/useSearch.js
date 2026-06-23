import { useQuery } from '@tanstack/react-query';
import courseService from '@/services/courseService';
import categoryService from '@/services/categoryService';

export function useSearch(query, filters, pagination) {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryService.getAllCategories(1, 100);
      return res?.content || [];
    },
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
  });

  const coursesQuery = useQuery({
    queryKey: ['search_courses', query, filters, pagination.page, pagination.size],
    queryFn: async () => {
      return await courseService.getPublicCourses({
        search: query,
        level: filters.level,
        categorySlug: filters.categorySlug,
        categoryId: filters.categoryId,
        page: pagination.page,
        size: pagination.size
      });
    },
    staleTime: 1000 * 60 * 1, // Cache trong 1 phút
  });

  return {
    categories: categoriesQuery.data || [],
    courses: coursesQuery.data?.content || [],
    totalElements: coursesQuery.data?.totalElements || 0,
    totalPages: coursesQuery.data?.totalPages || 0,
    loading: coursesQuery.isLoading || categoriesQuery.isLoading,
  };
}
