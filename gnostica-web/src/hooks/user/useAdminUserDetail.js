import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminUserDetailService } from "../../services/admin/adminUserDetailService";

export const useAdminUserDetail = (userId, isInstructor, activeDetailTab) => {
  // Summary Data
  const summaryQuery = useQuery({
    queryKey: ["admin_user_summary", userId],
    queryFn: () => adminUserDetailService.getUserSummary(userId),
    enabled: !!userId,
  });

  // Expandable row state
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Tab: Enrollments (Học viên - Khóa học)
  const [enrollmentPage, setEnrollmentPage] = useState(1);
  const [enrollmentSize, setEnrollmentSize] = useState(10);
  const enrollmentsQuery = useQuery({
    queryKey: ["admin_user_enrollments", userId, enrollmentPage],
    queryFn: () =>
      adminUserDetailService.getUserEnrollments(userId, enrollmentPage - 1, enrollmentSize),
    enabled: !!userId && !isInstructor && activeDetailTab === "COURSES",
  });

  const enrollmentProgressQuery = useQuery({
    queryKey: ["admin_user_enrollment_progress", userId, expandedCourseId],
    queryFn: () => adminUserDetailService.getEnrollmentProgress(userId, expandedCourseId),
    enabled: !!userId && !!expandedCourseId && activeDetailTab === "COURSES",
  });

  // Tab: Instructor Courses (Giảng viên - Khóa học)
  const [coursePage, setCoursePage] = useState(1);
  const [courseSize, setCourseSize] = useState(10);
  const coursesQuery = useQuery({
    queryKey: ["admin_user_courses", userId, coursePage],
    queryFn: () =>
      adminUserDetailService.getUserCourses(userId, coursePage - 1, courseSize),
    enabled: !!userId && isInstructor && activeDetailTab === "COURSES",
  });

  // Tab: Orders (Đơn hàng)
  const [orderPage, setOrderPage] = useState(1);
  const [orderSize, setOrderSize] = useState(10);
  const ordersQuery = useQuery({
    queryKey: ["admin_user_orders", userId, orderPage],
    queryFn: () =>
      adminUserDetailService.getUserOrders(userId, orderPage - 1, orderSize),
    enabled: !!userId && !isInstructor && activeDetailTab === "ORDERS",
  });

  const orderDetailsQuery = useQuery({
    queryKey: ["admin_user_order_details", userId, expandedOrderId],
    queryFn: () => adminUserDetailService.getOrderDetails(userId, expandedOrderId),
    enabled: !!userId && !!expandedOrderId && activeDetailTab === "ORDERS",
  });

  // Tab: Incomes (Thu nhập)
  const [incomePage, setIncomePage] = useState(1);
  const [incomeSize, setIncomeSize] = useState(10);
  const incomesQuery = useQuery({
    queryKey: ["admin_user_incomes", userId, incomePage],
    queryFn: () =>
      adminUserDetailService.getUserIncomes(userId, incomePage - 1, incomeSize),
    enabled: !!userId && isInstructor && activeDetailTab === "INCOME",
  });

  // Tab: Payouts (Rút tiền)
  const [payoutPage, setPayoutPage] = useState(1);
  const [payoutSize, setPayoutSize] = useState(10);
  const payoutsQuery = useQuery({
    queryKey: ["admin_user_payouts", userId, payoutPage],
    queryFn: () =>
      adminUserDetailService.getUserPayouts(userId, payoutPage - 1, payoutSize),
    enabled: !!userId && isInstructor && activeDetailTab === "PAYOUT",
  });

  // Tab: Threads (Bài viết)
  const [threadPage, setThreadPage] = useState(1);
  const [threadSize, setThreadSize] = useState(10);
  const threadsQuery = useQuery({
    queryKey: ["admin_user_threads", userId, threadPage],
    queryFn: () =>
      adminUserDetailService.getUserThreads(userId, threadPage - 1, threadSize),
    enabled: !!userId && activeDetailTab === "POSTS",
  });

  // Tab: Reviews (Đánh giá)
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewSize, setReviewSize] = useState(10);
  const reviewsQuery = useQuery({
    queryKey: ["admin_user_reviews", userId, reviewPage],
    queryFn: () =>
      adminUserDetailService.getUserReviews(userId, reviewPage - 1, reviewSize),
    enabled: !!userId && isInstructor && activeDetailTab === "REVIEWS",
  });

  // Tab: Activities (Hoạt động)
  const [activityPage, setActivityPage] = useState(1);
  const [activitySize, setActivitySize] = useState(10);
  const activitiesQuery = useQuery({
    queryKey: ["admin_user_activities", userId, activityPage],
    queryFn: () =>
      adminUserDetailService.getUserActivities(userId, activityPage - 1, activitySize),
    enabled: !!userId && activeDetailTab === "ACTIVITY",
  });

  return {
    summary: summaryQuery,
    
    // Enrollments
    enrollments: enrollmentsQuery,
    enrollmentPage,
    setEnrollmentPage,
    enrollmentSize,
    setEnrollmentSize,
    
    // Enrollment Progress
    enrollmentProgress: enrollmentProgressQuery,
    expandedCourseId,
    setExpandedCourseId,

    // Courses
    courses: coursesQuery,
    coursePage,
    setCoursePage,
    courseSize,
    setCourseSize,

    // Orders
    orders: ordersQuery,
    orderPage,
    setOrderPage,
    orderSize,
    setOrderSize,
    
    // Order Details
    orderDetails: orderDetailsQuery,
    expandedOrderId,
    setExpandedOrderId,

    // Incomes
    incomes: incomesQuery,
    incomePage,
    setIncomePage,
    incomeSize,
    setIncomeSize,

    // Payouts
    payouts: payoutsQuery,
    payoutPage,
    setPayoutPage,
    payoutSize,
    setPayoutSize,

    // Threads
    threads: threadsQuery,
    threadPage,
    setThreadPage,
    threadSize,
    setThreadSize,

    // Reviews
    reviews: reviewsQuery,
    reviewPage,
    setReviewPage,
    reviewSize,
    setReviewSize,

    // Activities
    activities: activitiesQuery,
    activityPage,
    setActivityPage,
    activitySize,
    setActivitySize,
  };
};
