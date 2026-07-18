import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import courseService from "@/services/course/courseService"

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
    queryKey: ["header-course-suggestions", debouncedQuery.toLocaleLowerCase("vi")],
    queryFn: ({ signal }) => courseService.getPublicCourses({
      search: debouncedQuery,
      page: 0,
      size: 5,
      signal,
    }),
    enabled: isSearchable,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
  })

  const courses = useMemo(() =>
    (searchQuery.data?.content || []).map(mapCourseSuggestion),
  [searchQuery.data])

  return {
    courses,
    isLoading: isSearchable && searchQuery.isFetching,
    hasServerResult: isSearchable && searchQuery.isSuccess,
    debouncedQuery,
  }
}
