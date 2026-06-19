import { useState, useEffect } from "react";
import { instructorDashboardService } from "@/services/instructorDashboardService";
import { Users, Star, Activity, DollarSign } from "lucide-react";

export default function useInstructorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          statsData, 
          revenueData, 
          ratingData, 
          growthData, 
          performanceData
        ] = await Promise.all([
          instructorDashboardService.getStats(),
          instructorDashboardService.getRevenueChart(),
          instructorDashboardService.getRatingDistribution(),
          instructorDashboardService.getStudentGrowthChart(),
          instructorDashboardService.getCoursePerformance()
        ]);

        const STATS = [
          {
            title: "Doanh Thu Tháng",
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(statsData.monthRevenue || 0),
            trend: `${statsData.revenueTrend > 0 ? '+' : ''}${statsData.revenueTrend.toFixed(1)}%`,
            isPositive: statsData.revenueTrend >= 0,
            icon: DollarSign,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100"
          },
          {
            title: "Học Viên Mới",
            value: (statsData.newStudents || 0).toLocaleString('vi-VN'),
            trend: `${statsData.studentTrend > 0 ? '+' : ''}${statsData.studentTrend.toFixed(1)}%`,
            isPositive: statsData.studentTrend >= 0,
            icon: Users,
            color: "text-info bg-blue-50 border-info/20"
          },
          {
            title: "Điểm Đánh Giá",
            value: (statsData.averageRating || 0).toFixed(1),
            trend: "+0.0", // mock trend cho rating
            isPositive: true,
            icon: Star,
            color: "text-amber-600 bg-amber-50 border-amber-100"
          },
          {
            title: "Tỷ Lệ Hoàn Thành",
            value: `${(statsData.completionRate || 0).toFixed(1)}%`,
            trend: "+0.0%", // mock trend
            isPositive: true,
            icon: Activity,
            color: "text-indigo-600 bg-indigo-50 border-indigo-100"
          },
        ];

        setData({
          STATS,
          REVENUE_DATA: revenueData,
          RATING_DISTRIBUTION: ratingData,
          STUDENT_GROWTH_DATA: growthData,
          COURSE_PERFORMANCE: performanceData,
          PENDING_TASKS: [] // Ẩn PendingTasks
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
}
