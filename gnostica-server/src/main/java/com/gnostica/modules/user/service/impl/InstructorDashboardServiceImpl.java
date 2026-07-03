package com.gnostica.modules.user.service.impl;
import com.gnostica.service.*;

import com.gnostica.dto.response.*;
import com.gnostica.modules.forum.dto.response.*;
import com.gnostica.modules.wallet.dto.response.*;
import com.gnostica.modules.dashboard.dto.response.*;
import com.gnostica.modules.order.dto.response.*;
import com.gnostica.modules.payment.dto.response.*;
import com.gnostica.modules.course.dto.response.*;
import com.gnostica.modules.user.dto.response.*;
import com.gnostica.core.model.*;
import com.gnostica.core.model.Module;
import com.gnostica.core.repository.*;
import com.gnostica.modules.user.service.InstructorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InstructorDashboardServiceImpl implements InstructorDashboardService {

    private final OrderDetailRepository orderDetailRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final CommentRepository commentRepository;

    @Override
    public InstructorDashboardStatsDTO getStats(String instructorEmail) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);

        Double thisMonthRevenue = orderDetailRepository.sumRevenueByInstructorEmailAndDateRange(instructorEmail, startOfThisMonth, now);
        Double lastMonthRevenue = orderDetailRepository.sumRevenueByInstructorEmailAndDateRange(instructorEmail, startOfLastMonth, startOfThisMonth);
        Double revenueTrend = calculateTrend(lastMonthRevenue, thisMonthRevenue);

        long thisMonthStudents = enrollmentRepository.countStudentsByInstructorEmailAndDateRange(instructorEmail, startOfThisMonth, now);
        long lastMonthStudents = enrollmentRepository.countStudentsByInstructorEmailAndDateRange(instructorEmail, startOfLastMonth, startOfThisMonth);
        Double studentTrend = calculateTrend((double) lastMonthStudents, (double) thisMonthStudents);

        Double averageRating = reviewRepository.getAverageRatingByInstructorEmail(instructorEmail);
        
        return InstructorDashboardStatsDTO.builder()
                .monthRevenue(thisMonthRevenue)
                .revenueTrend(revenueTrend)
                .newStudents(thisMonthStudents)
                .studentTrend(studentTrend)
                .averageRating(averageRating)
                .ratingTrend(0.0) 
                .completionRate(75.0) 
                .completionTrend(0.0)
                .build();
    }

    private Double calculateTrend(Double oldValue, Double newValue) {
        if (oldValue == null) oldValue = 0.0;
        if (newValue == null) newValue = 0.0;
        if (oldValue == 0) return newValue > 0 ? 100.0 : 0.0;
        return ((newValue - oldValue) / oldValue) * 100.0;
    }

    @Override
    public List<ChartDataDTO> getRevenueChart(String instructorEmail) {
        List<ChartDataDTO> chart = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime end = start.plusMonths(1);
            Double revenue = orderDetailRepository.sumRevenueByInstructorEmailAndDateRange(instructorEmail, start, end);
            String monthLabel = "T" + String.format("%02d", start.getMonthValue());
            chart.add(ChartDataDTO.builder().month(monthLabel).revenue(revenue != null ? revenue : 0.0).students(0L).build());
        }
        return chart;
    }

    @Override
    public List<RatingDistributionDTO> getRatingDistribution(String instructorEmail) {
        List<Object[]> rawCounts = reviewRepository.countRatingsByInstructorEmail(instructorEmail);
        int[] counts = new int[6];
        for (Object[] row : rawCounts) {
            if (row[0] != null && row[1] != null) {
                int rating = ((Number) row[0]).intValue();
                long count = ((Number) row[1]).longValue();
                if (rating >= 1 && rating <= 5) {
                    counts[rating] = (int) count;
                }
            }
        }
        
        return List.of(
            new RatingDistributionDTO("5 Sao", counts[5], "#10b981"),
            new RatingDistributionDTO("4 Sao", counts[4], "#3b82f6"),
            new RatingDistributionDTO("3 Sao", counts[3], "#f59e0b"),
            new RatingDistributionDTO("2 Sao", counts[2], "#ef4444"),
            new RatingDistributionDTO("1 Sao", counts[1], "#6b7280")
        );
    }

    @Override
    public List<ChartDataDTO> getStudentGrowthChart(String instructorEmail) {
        List<ChartDataDTO> chart = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime start = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime end = start.plusMonths(1);
            long students = enrollmentRepository.countStudentsByInstructorEmailAndDateRange(instructorEmail, start, end);
            String monthLabel = "T" + String.format("%02d", start.getMonthValue());
            chart.add(ChartDataDTO.builder().month(monthLabel).revenue(0.0).students(students).build());
        }
        return chart;
    }

    @Override
    public List<CoursePerformanceDTO> getCoursePerformance(String instructorEmail) {
        List<Course> courses = courseRepository.findByAccountEmailAndDeletedFalse(instructorEmail, org.springframework.data.domain.Pageable.unpaged()).getContent();
        return courses.stream().map(c -> {
            long students = c.getEnrollments() != null ? c.getEnrollments().size() : 0;
            long completed = c.getEnrollments() != null ? c.getEnrollments().stream().filter(e -> e.getProgressPercent() != null && e.getProgressPercent() >= 100).count() : 0;
            Double avgProgress = c.getEnrollments() != null && !c.getEnrollments().isEmpty() ? c.getEnrollments().stream().mapToDouble(e -> e.getProgressPercent() != null ? e.getProgressPercent() : 0).average().orElse(0.0) : 0.0;
            Double rating = reviewRepository.findByCourseOrderByCreatedAtDesc(c).stream().mapToDouble(Review::getRating).average().orElse(0.0);
            
            return CoursePerformanceDTO.builder()
                    .id(c.getId())
                    .title(c.getTitle())
                    .students(students)
                    .completed(students > 0 ? (double) completed / students * 100 : 0.0)
                    .avgProgress(avgProgress)
                    .rating(rating)
                    .status(c.getStatus() == 1 ? "active" : "draft")
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<InstructorQuestionDTO> getQuestions(String instructorEmail) {
        List<Course> courses = courseRepository.findByAccountEmailAndDeletedFalse(instructorEmail, org.springframework.data.domain.Pageable.unpaged()).getContent();
        List<String> lessonObjectIds = new ArrayList<>();
        for (Course c : courses) {
            if (c.getModules() != null) {
                for (Module m : c.getModules()) {
                    if (m.getLessons() != null) {
                        for (Lesson l : m.getLessons()) {
                            lessonObjectIds.add("lesson_" + l.getId());
                        }
                    }
                }
            }
        }
        
        if (lessonObjectIds.isEmpty()) return new ArrayList<>();

        List<Comment> comments = commentRepository.findByObjectIdInAndParentIsNullOrderByCreatedAtDesc(lessonObjectIds);
        
        return comments.stream().map(c -> {
            boolean isAnswered = c.getReplies() != null && c.getReplies().stream().anyMatch(r -> r.getAccount() != null && instructorEmail.equals(r.getAccount().getEmail()));
            
            String lessonName = "Bài học";
            String courseName = "Khóa học";
            for (Course course : courses) {
                if (course.getModules() != null) {
                    for (Module m : course.getModules()) {
                        if (m.getLessons() != null) {
                            for (Lesson l : m.getLessons()) {
                                if (("lesson_" + l.getId()).equals(c.getObjectId())) {
                                    lessonName = l.getTitle();
                                    courseName = course.getTitle();
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            return InstructorQuestionDTO.builder()
                    .id(c.getId())
                    .studentName(c.getAccount() != null ? c.getAccount().getFullName() : "Người dùng")
                    .studentAvatar(c.getAccount() != null ? c.getAccount().getAvatar() : null)
                    .courseName(courseName)
                    .lessonName(lessonName)
                    .content(c.getContent())
                    .createdAt(c.getCreatedAt())
                    .status(isAnswered ? "answered" : "unanswered")
                    .likes(c.getLikes())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<InstructorReviewDTO> getReviews(String instructorEmail) {
        List<Review> reviews = reviewRepository.findReviewsByInstructorEmail(instructorEmail);
        return reviews.stream().map(r -> {
            return InstructorReviewDTO.builder()
                    .id(r.getId())
                    .studentName(r.getAccount() != null ? r.getAccount().getFullName() : "Người dùng")
                    .studentAvatar(r.getAccount() != null ? r.getAccount().getAvatar() : null)
                    .courseName(r.getCourse() != null ? r.getCourse().getTitle() : "")
                    .rating(r.getRating())
                    .content(r.getContent())
                    .createdAt(r.getCreatedAt())
                    .status("not_responded") 
                    .build();
        }).collect(Collectors.toList());
    }
}
