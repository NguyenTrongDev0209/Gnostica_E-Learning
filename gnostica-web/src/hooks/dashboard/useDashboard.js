import { useState, useEffect } from 'react';
import dashboardService from '@/services/admin/dashboardService';

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [memberGrowth, setMemberGrowth] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [topInstructors, setTopInstructors] = useState([]);
  const [studentProductivity, setStudentProductivity] = useState(null);
  const [userDemographics, setUserDemographics] = useState(null);
  const [userRatings, setUserRatings] = useState([]);
  const [violations, setViolations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        statsData,
        growthData,
        revData,
        ordersData,
        coursesData,
        instructorsData,
        productivityData,
        demographicsData,
        ratingsData,
        violationsData
      ] = await Promise.all([
        dashboardService.getStats().catch(() => null),
        dashboardService.getMemberGrowth().catch(() => []),
        dashboardService.getRevenue().catch(() => []),
        dashboardService.getRecentOrders().catch(() => []),
        dashboardService.getTopCourses().catch(() => []),
        dashboardService.getTopInstructors().catch(() => []),
        dashboardService.getStudentProductivity().catch(() => null),
        dashboardService.getUserDemographics().catch(() => null),
        dashboardService.getUserRatings().catch(() => []),
        dashboardService.getViolations().catch(() => [])
      ]);

      setStats(statsData);
      setMemberGrowth(growthData || []);
      setRevenueData(revData || []);
      setRecentOrders(ordersData || []);
      setTopCourses(coursesData || []);
      setTopInstructors(instructorsData || []);
      setStudentProductivity(productivityData);
      setUserDemographics(demographicsData);
      setUserRatings(ratingsData || []);
      setViolations(violationsData || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchStats = async (period) => {
    try {
      const data = await dashboardService.getStats(period);
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRevenue = async (months) => {
    try {
      const data = await dashboardService.getRevenue(months);
      setRevenueData(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMemberGrowth = async (months) => {
    try {
      const data = await dashboardService.getMemberGrowth(months);
      setMemberGrowth(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTopInstructors = async (period) => {
    try {
      const data = await dashboardService.getTopInstructors(period);
      setTopInstructors(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudentProductivity = async (period) => {
    try {
      const data = await dashboardService.getStudentProductivity(period);
      setStudentProductivity(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserRatings = async (months) => {
    try {
      const data = await dashboardService.getUserRatings(months);
      setUserRatings(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchViolations = async (months) => {
    try {
      const data = await dashboardService.getViolations(months);
      setViolations(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    stats,
    memberGrowth,
    revenueData,
    recentOrders,
    topCourses,
    topInstructors,
    studentProductivity,
    userDemographics,
    userRatings,
    violations,
    isLoading,
    refresh: fetchDashboardData,
    fetchStats,
    fetchRevenue,
    fetchMemberGrowth,
    fetchTopInstructors,
    fetchStudentProductivity,
    fetchUserRatings,
    fetchViolations
  };
}
