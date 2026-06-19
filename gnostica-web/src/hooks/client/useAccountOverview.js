import { useQuery } from "@tanstack/react-query";
import enrollmentService from "@/services/enrollmentService";
import { toast } from "sonner";

export default function useAccountOverview() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['account_overview'],
    queryFn: async () => {
      const [statsRes, coursesRes] = await Promise.all([
        enrollmentService.getMyStats(),
        enrollmentService.getMyCourses()
      ]);

      let stats = null;
      let recentCourses = [];
      let recentCertificates = [];

      if (statsRes.success) {
        stats = statsRes.data;
      }

      if (coursesRes.success) {
        const courses = coursesRes.data;
        recentCourses = courses.slice(0, 3);
        
        recentCertificates = courses
          .filter(c => c.progressPercent === 100)
          .map(c => ({
            id: c.id,
            title: c.courseTitle,
            date: c.completedAt ? new Date(c.completedAt).toLocaleDateString('vi-VN') : "N/A",
            color: "from-blue-500 to-cyan-500", 
          }))
          .slice(0, 2);
      }

      return { stats, recentCourses, recentCertificates };
    },
    staleTime: 1000 * 60 * 5, // 5 phút cache
  });

  return {
    stats: data?.stats || null,
    recentCourses: data?.recentCourses || [],
    recentCertificates: data?.recentCertificates || [],
    loading
  };
}
