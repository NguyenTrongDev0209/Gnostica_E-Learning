import { useState, useEffect } from 'react';
import dashboardService from '@/services/dashboardService';

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [memberGrowth, setMemberGrowth] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, growthData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMemberGrowth()
      ]);
      
      setStats(statsData);
      setMemberGrowth(growthData);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { stats, memberGrowth, isLoading, refresh: fetchDashboardData };
}
