import { useState, useEffect } from "react";
import { MOCK_COURSES, MOCK_STATS } from "@/mocks/accountMocks";

export default function useMyCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCourses(MOCK_COURSES);
      setCategories([...new Set(MOCK_COURSES.map(c => c.category).filter(Boolean))]);
      setStats(MOCK_STATS);
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
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category);
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return {
    courses: filteredCourses,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    selectedCategories,
    setSelectedCategories,
    categories,
    totalCourses: courses.length,
    stats
  };
}
