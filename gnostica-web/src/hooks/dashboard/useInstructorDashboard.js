import { useQuery } from "@tanstack/react-query";
import { instructorDashboardService } from "@/services/instructor/instructorDashboardService";
import { Users, Star, Activity, DollarSign } from "lucide-react";
import { USE_INSTRUCTOR_MOCK, MOCK_DASHBOARD } from "@/mocks/instructorMockData";
export default function useInstructorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor_dashboard'],
    queryFn: async () => {
        let statsData, revenueData, ratingData, growthData, performanceData;
        try {
          const res = await Promise.all([
            instructorDashboardService.getStats(),
            instructorDashboardService.getRevenueChart(),
            instructorDashboardService.getRatingDistribution(),
            instructorDashboardService.getStudentGrowthChart(),
            instructorDashboardService.getCoursePerformance()
          ]);
          [statsData, revenueData, ratingData, growthData, performanceData] = res;
        } catch (e) {
          if (USE_INSTRUCTOR_MOCK) {
            console.log("Using Mock Data for Dashboard due to error");
          } else {
            throw e;
          }
        }

        if (USE_INSTRUCTOR_MOCK && (!statsData || !revenueData || !ratingData || !growthData || !performanceData)) {
          return MOCK_DASHBOARD;
        }

        const STATS = [
          {
            title: "Doanh Thu Tháng",
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(statsData?.monthRevenue || 0),
            trend: `${statsData?.revenueTrend > 0 ? '+' : ''}${statsData?.revenueTrend?.toFixed(1) || 0}%`,
            isPositive: statsData?.revenueTrend >= 0,
            icon: DollarSign,
            color: "bg-success text-white border-success"
          },
          {
            title: "Học Viên Mới",
            value: (statsData?.newStudents || 0).toLocaleString('vi-VN'),
            trend: `${statsData?.studentTrend > 0 ? '+' : ''}${statsData?.studentTrend?.toFixed(1) || 0}%`,
            isPositive: statsData?.studentTrend >= 0,
            icon: Users,
            color: "bg-info text-white border-info"
          },
          {
            title: "Điểm Đánh Giá",
            value: (statsData?.averageRating || 0).toFixed(1),
            trend: "+0.0", 
            isPositive: true,
            icon: Star,
            color: "bg-warning text-white border-warning"
          },
          {
            title: "Tỷ Lệ Hoàn Thành",
            value: `${(statsData?.completionRate || 0).toFixed(1)}%`,
            trend: "+0.0%", 
            isPositive: true,
            icon: Activity,
            color: "bg-primary text-white border-primary"
          },
        ];

        return {
          STATS,
          RAW_STATS: statsData || {},
          REVENUE_DATA: revenueData || [],
          RATING_DISTRIBUTION: ratingData || [],
          STUDENT_GROWTH_DATA: growthData || [],
          COURSE_PERFORMANCE: performanceData || [],
          PENDING_TASKS: []
        };
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });

  return { data, loading: isLoading };
}
