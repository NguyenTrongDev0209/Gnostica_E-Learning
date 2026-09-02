import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { instructorDashboardService } from "@/services/instructor/instructorDashboardService";
import { Users, Star, Activity, DollarSign } from "lucide-react";
import { USE_INSTRUCTOR_MOCK, MOCK_DASHBOARD } from "@/mocks/instructorMockData";

export default function useInstructorDashboard() {
  const [revenueMonths, setRevenueMonths] = useState(6);
  const [growthMonths, setGrowthMonths] = useState(6);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['instructor_dashboard', revenueMonths, growthMonths],
    queryFn: async () => {
        let statsData = null;
        let revenueData = [];
        let ratingData = [];
        let growthData = [];
        let performanceData = [];

        try {
          const results = await Promise.allSettled([
            instructorDashboardService.getStats(),
            instructorDashboardService.getRevenueChart(revenueMonths),
            instructorDashboardService.getRatingDistribution(),
            instructorDashboardService.getStudentGrowthChart(growthMonths),
            instructorDashboardService.getCoursePerformance()
          ]);

          if (results[0].status === 'fulfilled') statsData = results[0].value;
          if (results[1].status === 'fulfilled') revenueData = results[1].value;
          if (results[2].status === 'fulfilled') ratingData = results[2].value;
          if (results[3].status === 'fulfilled') growthData = results[3].value;
          if (results[4].status === 'fulfilled') performanceData = results[4].value;

          if (results.every(r => r.status === 'rejected')) {
            throw results[0].reason || new Error("Failed to load dashboard data");
          }
        } catch (e) {
          if (USE_INSTRUCTOR_MOCK) {
            console.log("Using Mock Data for Dashboard due to error", e);
            return MOCK_DASHBOARD;
          } else {
            throw e;
          }
        }

        if (USE_INSTRUCTOR_MOCK && (!statsData || !revenueData || !ratingData || !growthData || !performanceData)) {
          return MOCK_DASHBOARD;
        }

        const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

        const STATS = [
          {
            title: "Doanh Thu Tháng (Gross)",
            value: formatVND(statsData?.monthRevenue || 0),
            subtitle: `Thu nhập ròng: ${formatVND(statsData?.monthNetRevenue || 0)}`,
            trend: `${statsData?.revenueTrend > 0 ? '+' : ''}${(statsData?.revenueTrend || 0).toFixed(1)}%`,
            isPositive: (statsData?.revenueTrend || 0) >= 0,
            icon: DollarSign,
            color: "bg-success text-white border-success"
          },
          {
            title: "Học Viên Mới",
            value: (statsData?.newStudents || 0).toLocaleString('vi-VN'),
            subtitle: "Học viên duy nhất tháng này",
            trend: `${statsData?.studentTrend > 0 ? '+' : ''}${(statsData?.studentTrend || 0).toFixed(1)}%`,
            isPositive: (statsData?.studentTrend || 0) >= 0,
            icon: Users,
            color: "bg-info text-white border-info"
          },
          {
            title: "Điểm Đánh Giá",
            value: (statsData?.averageRating || 0).toFixed(1),
            subtitle: `${(statsData?.ratingCount || 0).toLocaleString('vi-VN')} đánh giá`,
            trend: `${statsData?.ratingTrend > 0 ? '+' : ''}${(statsData?.ratingTrend || 0).toFixed(1)}%`, 
            isPositive: (statsData?.ratingTrend || 0) >= 0,
            icon: Star,
            color: "bg-warning text-white border-warning"
          },
          {
            title: "Tỷ Lệ Hoàn Thành",
            value: `${(statsData?.completionRate || 0).toFixed(1)}%`,
            subtitle: "Học viên đã học xong",
            trend: `${statsData?.completionTrend > 0 ? '+' : ''}${(statsData?.completionTrend || 0).toFixed(1)}%`, 
            isPositive: (statsData?.completionTrend || 0) >= 0,
            icon: Activity,
            color: "bg-primary text-white border-primary"
          },
        ];

        return {
          STATS,
          RAW_STATS: statsData || {},
          REVENUE_DATA: Array.isArray(revenueData) ? revenueData : [],
          RATING_DISTRIBUTION: Array.isArray(ratingData) ? ratingData : [],
          STUDENT_GROWTH_DATA: Array.isArray(growthData) ? growthData : [],
          COURSE_PERFORMANCE: Array.isArray(performanceData) ? performanceData : [],
          PENDING_TASKS: []
        };
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  return {
    data,
    loading: isLoading,
    error,
    refetch,
    revenueMonths,
    setRevenueMonths,
    growthMonths,
    setGrowthMonths
  };
}
