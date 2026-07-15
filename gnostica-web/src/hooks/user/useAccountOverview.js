import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";

export default function useAccountOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: null, recentCourses: [], recentCertificates: [] });
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = {
          "Authorization": `Bearer ${token}`
        };

        const [statsRes, coursesRes, certsRes] = await Promise.all([
          fetch("http://localhost:8080/api/enrollments/stats", { headers }),
          fetch("http://localhost:8080/api/enrollments/my-courses", { headers }),
          fetch("http://localhost:8080/api/certificates/my-certificates", { headers })
        ]);

        const statsData = statsRes.ok ? await statsRes.json() : null;
        const coursesData = coursesRes.ok ? await coursesRes.json() : [];
        const certsData = certsRes.ok ? await certsRes.json() : [];

        // Format data if needed
        const recentCourses = (coursesData.data || []).slice(0, 3).map(c => ({
          id: c.courseId,
          slug: c.courseSlug,
          courseTitle: c.courseTitle,
          thumbnail: c.courseThumbnail || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
          instructor: c.instructorName,
          category: "Lập trình", // Backend doesn't return category yet, hardcode or remove
          progressPercent: c.progressPercent || 0,
          lastAccessed: c.lastWatchedLessonSlug ? "Hôm nay" : "Chưa học"
        }));

        const recentCertificates = (Array.isArray(certsData) ? certsData : []).slice(0, 3).map((c, idx) => ({
          id: c.certifiUrl || `CERT-${idx}`,
          title: c.courseTitle,
          date: c.completedAt ? new Date(c.completedAt).toLocaleDateString("vi-VN") : "Gần đây",
          color: "from-primary to-blue-500",
        }));

        setData({
          stats: statsData?.data || { enrolledCourses: 0, completedCourses: 0, hoursStudied: 0 },
          recentCourses,
          recentCertificates
        });
      } catch (error) {
        console.error("Failed to fetch account overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return {
    stats: data.stats,
    recentCourses: data.recentCourses,
    recentCertificates: data.recentCertificates,
    loading
  };
}
