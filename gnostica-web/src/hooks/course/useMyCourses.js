import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";

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
        const headers = {
          "Authorization": `Bearer ${token}`
        };

        const [coursesRes, statsRes] = await Promise.all([
          fetch("http://localhost:8080/api/enrollments/my-courses", { headers }),
          fetch("http://localhost:8080/api/enrollments/stats", { headers })
        ]);

        const coursesData = coursesRes.ok ? await coursesRes.json() : [];
        const statsData = statsRes.ok ? await statsRes.json() : null;

        const formattedCourses = (coursesData.data || []).map(c => ({
          id: c.courseId,
          slug: c.courseSlug,
          courseTitle: c.courseTitle,
          courseThumbnail: c.courseThumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
          instructorName: c.instructorName,
          category: "Lập trình", // Backend doesn't return category yet, hardcode or remove
          progressPercent: c.progressPercent || 0,
          lastAccessed: c.lastWatchedLessonSlug ? "Hôm nay" : "Chưa học",
          completedAt: c.completedAt,
          joinedAt: c.joinedAt,
          firstLessonId: c.firstLessonId,
          lastWatchedLessonSlug: c.lastWatchedLessonSlug,
          certifiUrl: c.certifiUrl
        }));

        setCourses(formattedCourses);
        setCategories(["Lập trình"]); // Replace with real categories when API supports it
        setStats(statsData?.data || { enrolledCourses: 0, completedCourses: 0, hoursStudied: 0 });
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
