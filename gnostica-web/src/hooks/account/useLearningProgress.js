import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { API_URL } from "@/config/environment";

export default function useLearningProgress() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { "Authorization": `Bearer ${token}` };
        const [coursesRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/enrollments/my-courses`, { headers }),
          fetch(`${API_URL}/enrollments/stats`, { headers })
        ]);

        const coursesData = coursesRes.ok ? await coursesRes.json() : [];
        const statsData = statsRes.ok ? await statsRes.json() : null;

        const formattedCourses = (coursesData.data || []).map(c => ({
          id: c.courseId,
          courseId: c.courseId,
          courseTitle: c.courseTitle,
          progressPercent: c.progressPercent || 0,
          completedLessons: c.completedLessons || 0,
          totalLessons: c.totalLessons || 0,
          joinedAt: c.joinedAt,
          lastAccessed: c.lastAccessed,
          completedAt: c.completedAt
        }));

        setCourses(formattedCourses);
        setStats(statsData?.data || { enrolledCourses: 0, completedCourses: 0, hoursStudied: 0 });
      } catch (error) {
        console.error("Failed to fetch learning progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    courses,
    stats,
    loading
  };
}
