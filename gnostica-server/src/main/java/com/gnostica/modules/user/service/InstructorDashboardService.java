package com.gnostica.modules.user.service;

import com.gnostica.dto.response.*;
import com.gnostica.modules.user.dto.response.*;

import java.util.List;

public interface InstructorDashboardService {
    InstructorDashboardStatsDTO getStats(String instructorEmail);
    List<ChartDataDTO> getRevenueChart(String instructorEmail);
    List<RatingDistributionDTO> getRatingDistribution(String instructorEmail);
    List<ChartDataDTO> getStudentGrowthChart(String instructorEmail);
    List<CoursePerformanceDTO> getCoursePerformance(String instructorEmail);
    List<InstructorQuestionDTO> getQuestions(String instructorEmail);
    List<InstructorReviewDTO> getReviews(String instructorEmail);
}
