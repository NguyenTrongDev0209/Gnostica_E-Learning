import { useState, useEffect } from "react";
import useAuthStore from "@/store/useAuthStore";
import { API_URL } from "@/config/environment";
import walletService from "@/services/payment/walletService";
import enrollmentService from "@/services/course/enrollmentService";

export default function useAccountOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: null, recentCourses: [], recentCertificates: [], wallet: null });
  const token = useAuthStore(state => state.user?.token);

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = {
          "Authorization": `Bearer ${token}`
        };

        const [statsData, coursesData, certsRes, walletData] = await Promise.all([
          enrollmentService.getMyStats().catch(() => null),
          enrollmentService.getMyCourses().catch(() => []),
          fetch(`${API_URL}/certificates/my-certificates`, { headers }).catch(() => ({ ok: false })),
          walletService.getMyWallet().catch(() => null)
        ]);

        const certsData = certsRes && certsRes.ok ? await certsRes.json() : [];
        const rawCourses = Array.isArray(coursesData) ? coursesData : (coursesData?.data || []);

        const recentCourses = rawCourses.map(c => ({
          ...c,
          id: c.courseId || c.id,
          courseId: c.courseId || c.id,
          courseSlug: c.courseSlug || c.slug,
          slug: c.courseSlug || c.slug,
          courseTitle: c.courseTitle || c.title,
          courseThumbnail: c.courseThumbnail || c.thumbnail,
          thumbnail: c.courseThumbnail || c.thumbnail,
          category: c.category,
          progressPercent: c.progressPercent || 0,
          lastAccessed: c.lastWatchedLessonSlug ? "Hôm nay" : "Chưa học",
          joinedAt: c.joinedAt,
          completedAt: c.completedAt,
          firstLessonId: c.firstLessonId,
          lastWatchedLessonSlug: c.lastWatchedLessonSlug,
          certificateUrl: c.certificateUrl || c.certifiUrl
        }));

        const recentCertificates = (Array.isArray(certsData) ? certsData : []).slice(0, 3).map((c, idx) => ({
          id: c.certifiUrl || `CERT-${idx}`,
          title: c.courseTitle,
          date: c.completedAt ? new Date(c.completedAt).toLocaleDateString("vi-VN") : "Gần đây",
          color: "from-primary to-blue-500",
        }));

        setData({
          stats: {
            ...(statsData || { enrolledCourses: 0, completedCourses: 0, hoursStudied: 0 }),
            walletBalance: walletData?.remain || 0
          },
          recentCourses,
          recentCertificates,
          wallet: walletData
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
    wallet: data.wallet,
    loading
  };
}
