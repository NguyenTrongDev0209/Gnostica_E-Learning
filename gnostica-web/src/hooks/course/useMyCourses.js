import { useState, useEffect } from "react";
import { MOCK_COURSES } from "@/mocks/accountMocks";

export default function useMyCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCourses(MOCK_COURSES);
      setLoading(false);
    }, 600);
  }, []);

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
