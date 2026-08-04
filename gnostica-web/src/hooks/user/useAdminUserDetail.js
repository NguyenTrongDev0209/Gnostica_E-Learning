import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminUserDetailService } from "../../services/admin/adminUserDetailService";

export const useAdminUserDetail = (userId, isInstructor) => {
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
  const enrollmentSize = 10;
  const enrollmentsQuery = useQuery({
    queryKey: ["admin_user_enrollments", userId, enrollmentPage],
    queryFn: () =>
      adminUserDetailService.getUserEnrollments(userId, enrollmentPage - 1, enrollmentSize),
    enabled: !!userId && !isInstructor,
  });

  const enrollmentProgressQuery = useQuery({
    queryKey: ["admin_user_enrollment_progress", userId, expandedCourseId],
    queryFn: () => adminUserDetailService.getEnrollmentProgress(userId, expandedCourseId),
    enabled: !!userId && !!expandedCourseId,
  });

  // Tab: Instructor Courses (Giảng viên - Khóa học)
  const [coursePage, setCoursePage] = useState(1);
  const courseSize = 10;
  const coursesQuery = useQuery({
    queryKey: ["admin_user_courses", userId, coursePage],
    queryFn: () =>
      adminUserDetailService.getUserCourses(userId, coursePage - 1, courseSize),
    enabled: !!userId && isInstructor,
  });

  // Tab: Orders (Đơn hàng)
  const [orderPage, setOrderPage] = useState(1);
  const orderSize = 10;
  const ordersQuery = useQuery({
    queryKey: ["admin_user_orders", userId, orderPage],
    queryFn: () =>
      adminUserDetailService.getUserOrders(userId, orderPage - 1, orderSize),
    enabled: !!userId && !isInstructor,
  });

  const orderDetailsQuery = useQuery({
    queryKey: ["admin_user_order_details", userId, expandedOrderId],
    queryFn: () => adminUserDetailService.getOrderDetails(userId, expandedOrderId),
    enabled: !!userId && !!expandedOrderId,
  });

  // Tab: Incomes (Thu nhập)
  const [incomePage, setIncomePage] = useState(1);
  const incomeSize = 10;
  const incomesQuery = useQuery({
    queryKey: ["admin_user_incomes", userId, incomePage],
    queryFn: () =>
      adminUserDetailService.getUserIncomes(userId, incomePage - 1, incomeSize),
    enabled: !!userId && isInstructor,
  });

  // Tab: Payouts (Rút tiền)
  const [payoutPage, setPayoutPage] = useState(1);
  const payoutSize = 10;
  const payoutsQuery = useQuery({
    queryKey: ["admin_user_payouts", userId, payoutPage],
    queryFn: () =>
      adminUserDetailService.getUserPayouts(userId, payoutPage - 1, payoutSize),
    enabled: !!userId && isInstructor,
  });

  // Tab: Threads (Bài viết)
  const [threadPage, setThreadPage] = useState(1);
  const threadSize = 10;
  const threadsQuery = useQuery({
    queryKey: ["admin_user_threads", userId, threadPage],
    queryFn: () =>
      adminUserDetailService.getUserThreads(userId, threadPage - 1, threadSize),
    enabled: !!userId,
  });

  // Tab: Reviews (Đánh giá)
  const [reviewPage, setReviewPage] = useState(1);
  const reviewSize = 10;
  const reviewsQuery = useQuery({
    queryKey: ["admin_user_reviews", userId, reviewPage],
    queryFn: () =>
      adminUserDetailService.getUserReviews(userId, reviewPage - 1, reviewSize),
    enabled: !!userId && isInstructor,
  });

  return {
    summary: summaryQuery,
    
    // Enrollments
    enrollments: enrollmentsQuery,
    enrollmentPage,
    setEnrollmentPage,
    enrollmentSize,
    
    // Enrollment Progress
    enrollmentProgress: enrollmentProgressQuery,
    expandedCourseId,
    setExpandedCourseId,

    // Courses
    courses: coursesQuery,
    coursePage,
    setCoursePage,
    courseSize,

    // Orders
    orders: ordersQuery,
    orderPage,
    setOrderPage,
    orderSize,
    
    // Order Details
    orderDetails: orderDetailsQuery,
    expandedOrderId,
    setExpandedOrderId,

    // Incomes
    incomes: incomesQuery,
    incomePage,
    setIncomePage,
    incomeSize,

    // Payouts
    payouts: payoutsQuery,
    payoutPage,
    setPayoutPage,
    payoutSize,

    // Threads
    threads: threadsQuery,
    threadPage,
    setThreadPage,
    threadSize,

    // Reviews
    reviews: reviewsQuery,
    reviewPage,
    setReviewPage,
    reviewSize,
  };
};
