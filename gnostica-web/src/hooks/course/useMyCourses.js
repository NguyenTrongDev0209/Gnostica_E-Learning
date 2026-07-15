import { useState, useEffect } from "react";
import { MOCK_COURSES, MOCK_STATS } from "@/mocks/accountMocks";

export default function useMyCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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
    
    // Mock logic for dateRange, assuming date filtering isn't implemented in mock yet
    // In real app, filter by enrollmentDate etc.
    let matchesDate = true;
    if (dateRange?.from) {
      // Dummy date filtering since MOCK_COURSES might not have dates
      matchesDate = true; 
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
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
    dateRange,
    setDateRange,
    categories,
    currentPage,
    setCurrentPage,
    totalPages: Math.ceil(filteredCourses.length / 5) || 1,
    totalCourses: courses.length,
    stats
  };
}
