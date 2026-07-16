import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { MOCK_MY_COURSES, MOCK_MY_COURSES_STATS } from "@/mocks/myCoursesMocks";

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
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true);
      try {
        // MOCK DATA DELAY
        await new Promise(resolve => setTimeout(resolve, 800));

        setCourses(MOCK_MY_COURSES);
        const uniqueCategories = [...new Set(MOCK_MY_COURSES.map(c => c.category).filter(Boolean))];
        setCategories(uniqueCategories);
        setStats(MOCK_MY_COURSES_STATS);
      } catch (error) {
        console.error("Failed to fetch my courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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
    
    let matchesDate = true;
    if (dateRange?.from && course.joinedAt) {
      const courseDate = new Date(course.joinedAt);
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      
      if (dateRange.to) {
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        matchesDate = courseDate >= from && courseDate <= to;
      } else {
        matchesDate = courseDate >= from;
      }
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedCategories, dateRange]);

  const ITEMS_PER_PAGE = 5;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return {
    courses: paginatedCourses,
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
    totalPages: Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) || 1,
    totalCourses: courses.length,
    totalFilteredCourses: filteredCourses.length,
    stats
  };
}
