import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import enrollmentService from "@/services/course/enrollmentService";

export default function useMyCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['my_courses'],
    queryFn: async () => {
      const response = await enrollmentService.getMyCourses();
      return response?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  const getStatus = (progress) => {
    if (progress === 100) return "completed";
    if (progress > 0) return "in_progress";
    return "not_started";
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getStatus(course.progressPercent);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    courses: filteredCourses,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    totalCourses: courses.length
  };
}
