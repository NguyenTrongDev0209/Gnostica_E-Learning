import { useQuery } from '@tanstack/react-query';
import courseService from '@/services/course/courseService';
import categoryService from '@/services/course/categoryService';
import { rankRelatedCourses } from '@/utils/courseRecommendations';

const filterCategoriesByCourses = (categories, courses) => {
  const categoryIds = new Set(courses.map((course) => Number(course.categoryId)).filter(Number.isFinite));

  return categories.reduce((filtered, category) => {
    const matchingChildren = (category.subcategories || []).filter((child) => categoryIds.has(Number(child.id)));
    if (!categoryIds.has(Number(category.id)) && matchingChildren.length === 0) return filtered;

    filtered.push({
      ...category,
      courses: categoryIds.has(Number(category.id))
        ? Math.max(Number(category.courses) || 0, 1)
        : matchingChildren.reduce((total, child) => total + (Number(child.courses) || 1), 0),
      subcategories: matchingChildren.map((child) => ({
        ...child,
        courses: Math.max(Number(child.courses) || 0, 1),
      })),
    });
    return filtered;
  }, []);
};

export function useSearch(query, filters, pagination) {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryService.getAllCategories(1, 100);
      return res?.data?.content || res?.content || [];
    },
    staleTime: 1000 * 60 * 5, // Cache trong 5 phút
  });

  const coursesQuery = useQuery({
    queryKey: ['search_courses', query, filters, pagination.page, pagination.size],
    queryFn: async () => {
      return await courseService.getPublicCourses({
        search: query,
        levels: filters.levels,
        categorySlugs: filters.categorySlugs,
        categoryId: filters.categoryId,
        minPrice: filters.priceRange?.[0],
        maxPrice: filters.priceRange?.[1],
        page: pagination.page,
        size: pagination.size
      });
    },
    staleTime: 1000 * 60 * 1, // Cache trong 1 phút
  });

  const categoryFacetQuery = useQuery({
    queryKey: ['search_category_facets', query, filters.levels, filters.priceRange],
    queryFn: async () => {
      const requestPage = (facetPage) => courseService.getPublicCourses({
        search: query,
        levels: filters.levels,
        minPrice: filters.priceRange?.[0],
        maxPrice: filters.priceRange?.[1],
        page: facetPage,
        size: 20,
      });
      const firstPage = await requestPage(0);
      const pageCount = firstPage?.totalPages || 1;
      if (pageCount <= 1) return firstPage?.content || [];

      const remainingPages = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) => requestPage(index + 1))
      );
      return [firstPage, ...remainingPages].flatMap((result) => result?.content || []);
    },
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60,
  });

  const suggestionsQuery = useQuery({
    queryKey: ['search_course_suggestions', query],
    queryFn: async () => {
      const firstPage = await courseService.getPublicCourses({ page: 0, size: 20 });
      const pageCount = Math.min(firstPage?.totalPages || 1, 5);
      if (pageCount <= 1) return firstPage?.content || [];

      const remainingPages = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
          courseService.getPublicCourses({ page: index + 1, size: 20 })
        )
      );
      return [firstPage, ...remainingPages].flatMap((result) => result?.content || []);
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const courses = coursesQuery.data?.content || [];
  const suggestionPool = suggestionsQuery.data || [];
  const allCategories = categoriesQuery.data || [];
  const resultCategories = query.trim()
    ? filterCategoriesByCourses(allCategories, categoryFacetQuery.data || [])
    : allCategories;

  return {
    categories: resultCategories,
    courses,
    suggestedCourses: rankRelatedCourses(query, suggestionPool, courses.map((course) => course.id)),
    totalElements: coursesQuery.data?.totalElements || 0,
    totalPages: coursesQuery.data?.totalPages || 0,
    loading: coursesQuery.isLoading || categoriesQuery.isLoading || categoryFacetQuery.isLoading,
    suggestionsLoading: suggestionsQuery.isLoading,
  };
}
