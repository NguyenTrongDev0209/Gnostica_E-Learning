package com.gnostica.modules.user.service;

import com.gnostica.modules.user.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;
import java.util.List;

public interface AdminUserDetailService {
    AdminUserSummaryDTO getUserSummary(UUID userId);
    Page<AdminEnrollmentDTO> getUserEnrollments(UUID userId, Pageable pageable);
    AdminEnrollmentProgressDTO getEnrollmentProgress(Integer enrollmentId);
    Page<AdminInstructorCourseDTO> getUserCourses(UUID userId, Pageable pageable);
    Page<AdminOrderDTO> getUserOrders(UUID userId, Pageable pageable);
    List<AdminOrderDetailDTO> getOrderDetails(UUID orderId);
    Page<AdminIncomeDTO> getUserIncomes(UUID userId, Pageable pageable);
    Page<AdminPayoutDTO> getUserPayouts(UUID userId, Pageable pageable);
    Page<AdminThreadDTO> getUserThreads(UUID userId, Pageable pageable);
    Page<AdminReviewDTO> getUserReviews(UUID userId, Pageable pageable);
}
