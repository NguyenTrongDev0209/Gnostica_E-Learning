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
            color: "text-success bg-success/10 border-success/20"
          },
          {
            title: "Học Viên Mới",
            value: (statsData?.newStudents || 0).toLocaleString('vi-VN'),
            trend: `${statsData?.studentTrend > 0 ? '+' : ''}${statsData?.studentTrend?.toFixed(1) || 0}%`,
            isPositive: statsData?.studentTrend >= 0,
            icon: Users,
            color: "text-info bg-info/10 border-info/20"
          },
          {
            title: "Điểm Đánh Giá",
            value: (statsData?.averageRating || 0).toFixed(1),
            trend: "+0.0", 
            isPositive: true,
            icon: Star,
            color: "text-warning bg-warning/10 border-warning/20"
          },
          {
            title: "Tỷ Lệ Hoàn Thành",
            value: `${(statsData?.completionRate || 0).toFixed(1)}%`,
            trend: "+0.0%", 
            isPositive: true,
            icon: Activity,
            color: "text-primary bg-primary/10 border-primary/20"
          },
        ];

        return {
          STATS,
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
