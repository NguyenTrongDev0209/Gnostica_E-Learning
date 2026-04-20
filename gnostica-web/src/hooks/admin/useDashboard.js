import { useState, useEffect } from 'react';
import dashboardService from '@/services/dashboardService';

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [memberGrowth, setMemberGrowth] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, growthData, revData, ordersData, coursesData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMemberGrowth(),
        dashboardService.getRevenue(),
        dashboardService.getRecentOrders(),
        dashboardService.getTopCourses()
      ]);

      setStats(statsData);
      setMemberGrowth(growthData);
      setRevenueData(revData);
      setRecentOrders(ordersData);
      setTopCourses(coursesData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    memberGrowth,
    revenueData,
    recentOrders,
    topCourses,
    isLoading,
    refresh: fetchDashboardData
  };
}
