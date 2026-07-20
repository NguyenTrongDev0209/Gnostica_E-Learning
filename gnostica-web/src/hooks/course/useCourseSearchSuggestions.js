import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import courseService from "@/services/course/courseService"
import categoryService from "@/services/course/categoryService"

const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [delay, value])

  return debouncedValue
}

const mapCourseSuggestion = (course) => ({
  id: course.id,
  slug: course.slug,
  title: course.title,
  category: course.categoryName || course.category?.name || "Khóa học",
  instructor: course.instructorName || course.instructor?.fullName || "Gnostica",
  image: course.thumbnail || course.image || "/banner_small1.webp",
})

export const useCourseSearchSuggestions = (query) => {
  const normalizedQuery = query.trim()
  const debouncedQuery = useDebouncedValue(normalizedQuery, 350)
  const isSearchable = debouncedQuery.length >= 2

  const searchQuery = useQuery({
    queryKey: ["header-course-suggestion-catalog"],
    queryFn: async ({ signal }) => {
      const firstPage = await courseService.getPublicCourses({ page: 0, size: 20, signal })
      const pageCount = Math.min(firstPage?.totalPages || 1, 5)
      if (pageCount <= 1) return firstPage?.content || []
      const remainingPages = await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
          courseService.getPublicCourses({ page: index + 1, size: 20, signal })
        )
      )
      return [firstPage, ...remainingPages].flatMap((result) => result?.content || [])
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  })

  const categoriesQuery = useQuery({
    queryKey: ["header-category-suggestions"],
    queryFn: async () => {
      const response = await categoryService.getAllCategories(1, 100)
      const parents = response?.data?.content || response?.content || []
      return parents.flatMap((category) => [category, ...(category.subcategories || [])])
        .filter((category) => category.status !== false)
        .map((category) => ({ id: category.id, label: category.name, slug: category.slug }))
    },
    staleTime: 5 * 60 * 1000,
  })

  const courses = useMemo(() =>
    (searchQuery.data || []).map(mapCourseSuggestion),
  [searchQuery.data])

  return {
    courses,
    categories: categoriesQuery.data || [],
    isLoading: isSearchable && (searchQuery.isFetching || categoriesQuery.isFetching),
    hasServerResult: searchQuery.isSuccess,
    debouncedQuery,
  }
}
