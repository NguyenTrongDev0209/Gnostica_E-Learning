package com.gnostica.modules.user.service.impl;

import com.gnostica.modules.forum.dto.response.*;
import com.gnostica.modules.wallet.dto.response.*;
import com.gnostica.modules.dashboard.dto.response.*;
import com.gnostica.modules.checkout.dto.response.*;
import com.gnostica.modules.checkout.dto.response.*;
import com.gnostica.modules.course.dto.response.*;
import com.gnostica.modules.user.dto.response.*;
import com.gnostica.core.model.*;
import com.gnostica.core.model.Module;
import com.gnostica.core.repository.*;
import com.gnostica.modules.user.service.InstructorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final LessonRepository lessonRepository;

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
        List<Course> courses = courseRepository.findByAccountEmailAndDeletedAtIsNull(instructorEmail, org.springframework.data.domain.Pageable.unpaged()).getContent();
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

    private List<InstructorQuestionReplyDTO> mapReplies(List<Comment> replies, String instructorEmail) {
        if (replies == null || replies.isEmpty()) return new ArrayList<>();
        List<InstructorQuestionReplyDTO> dtos = new ArrayList<>();
        for (Comment r : replies) {
            boolean isAuthor = r.getAccount() != null && instructorEmail.equals(r.getAccount().getEmail());
            dtos.add(InstructorQuestionReplyDTO.builder()
                    .id(r.getId())
                    .content(r.getContent())
                    .studentName(r.getAccount() != null ? r.getAccount().getFullName() : "N/A")
                    .studentAvatar(r.getAccount() != null ? r.getAccount().getAvatar() : null)
                    .createdAt(r.getCreatedAt())
                    .isAuthor(isAuthor)
                    .isHidden(Integer.valueOf(0).equals(r.getStatus()))
                    .replies(mapReplies(r.getReplies(), instructorEmail))
                    .build());
        }
        return dtos;
    }

    private boolean checkIsAnswered(List<Comment> replies, String instructorEmail) {
        if (replies == null || replies.isEmpty()) return false;
        for (Comment r : replies) {
            if (r.getAccount() != null && instructorEmail.equals(r.getAccount().getEmail())) {
                return true;
            }
            if (checkIsAnswered(r.getReplies(), instructorEmail)) {
                return true;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public List<InstructorQuestionDTO> getQuestions(String instructorEmail) {
        List<Course> courses = courseRepository.findByAccountEmailAndDeletedAtIsNull(instructorEmail, org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();
        List<String> lessonIds = new ArrayList<>();
        
        for (Course c : courses) {
            if (c.getModules() != null) {
                for (com.gnostica.core.model.Module m : c.getModules()) {
                    if (m.getLessons() != null) {
                        for (com.gnostica.core.model.Lesson l : m.getLessons()) {
                            lessonIds.add(String.valueOf(l.getId()));
                        }
                    }
                }
            }
        }
        
        if (lessonIds.isEmpty()) {
            System.out.println("DEBUG getQuestions: lessonIds is EMPTY for instructor " + instructorEmail);
            return new ArrayList<>();
        }
        
        System.out.println("DEBUG getQuestions: lessonIds for " + instructorEmail + " = " + lessonIds);
        List<Comment> comments = commentRepository.findByTargetTypeAndTargetIdInAndParentIsNullOrderByCreatedAtDesc("LESSON", lessonIds);
        System.out.println("DEBUG getQuestions: comments found = " + comments.size());
        
        return comments.stream().map(c -> {
            try {
                boolean isAnswered = checkIsAnswered(c.getReplies(), instructorEmail);
                List<InstructorQuestionReplyDTO> replyDTOs = mapReplies(c.getReplies(), instructorEmail);
                
                String lessonName = "Bài học không rõ";
                String courseName = "Khóa học không rõ";
                
                try {
                    java.util.Optional<com.gnostica.core.model.Lesson> lOpt = lessonRepository.findById(Integer.parseInt(c.getTargetId()));
                    if (lOpt.isPresent()) {
                        com.gnostica.core.model.Lesson l = lOpt.get();
                        lessonName = l.getTitle() != null ? l.getTitle() : lessonName;
                        if (l.getModule() != null && l.getModule().getCourse() != null) {
                            courseName = l.getModule().getCourse().getTitle() != null ? l.getModule().getCourse().getTitle() : courseName;
                        }
                    }
                } catch (Exception ignored) {}
                
                return InstructorQuestionDTO.builder()
                        .id(c.getId())
                        .studentName(c.getAccount() != null ? c.getAccount().getFullName() : "Người dùng ẩn danh")
                        .studentAvatar(c.getAccount() != null ? c.getAccount().getAvatar() : null)
                        .courseName(courseName)
                        .lessonName(lessonName)
                        .targetId(c.getTargetId())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .status(isAnswered ? "answered" : "unanswered")
                        .isHidden(Integer.valueOf(0).equals(c.getStatus()))
                        .likes(0) // Default to 0 as likes are not stored directly on Comment
                        .replies(replyDTOs)
                        .build();
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }

    private List<InstructorReviewReplyDTO> mapReviewReplies(Review parent, List<Review> allReviews, String instructorEmail) {
        List<Review> childReviews = allReviews.stream()
                .filter(child -> child.getParent() != null && child.getParent().getId().equals(parent.getId()))
                .collect(Collectors.toList());
        return childReviews.stream().map(child -> InstructorReviewReplyDTO.builder()
                .id(child.getId())
                .studentName(child.getAccount() != null ? child.getAccount().getFullName() : "Người dùng")
                .studentAvatar(child.getAccount() != null ? child.getAccount().getAvatar() : null)
                .content(child.getComment())
                .createdAt(child.getCreatedAt())
                .isAuthor(child.getAccount() != null && instructorEmail.equals(child.getAccount().getEmail()))
                .replies(mapReviewReplies(child, allReviews, instructorEmail))
                .build()).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InstructorReviewDTO> getReviews(String instructorEmail) {
        List<Review> reviews = reviewRepository.findReviewsByInstructorEmail(instructorEmail);
        List<Review> allReviews = reviewRepository.findAll();
        
        return reviews.stream().map(r -> {
            try {
                boolean hasReplies = allReviews.stream().anyMatch(child -> child.getParent() != null && child.getParent().getId().equals(r.getId()));
                List<InstructorReviewReplyDTO> replyDTOs = mapReviewReplies(r, allReviews, instructorEmail);

                return InstructorReviewDTO.builder()
                        .id(r.getId())
                        .studentName(r.getAccount() != null ? r.getAccount().getFullName() : "Người dùng")
                        .studentAvatar(r.getAccount() != null ? r.getAccount().getAvatar() : null)
                        .courseName(r.getCourse() != null && r.getCourse().getTitle() != null ? r.getCourse().getTitle() : "")
                        .rating(r.getRating() != null ? r.getRating() : 0)
                        .content(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .status(hasReplies ? "responded" : "not_responded")
                        .isAuthor(r.getAccount() != null && instructorEmail.equals(r.getAccount().getEmail()))
                        .replies(replyDTOs)
                        .build();
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }
}

