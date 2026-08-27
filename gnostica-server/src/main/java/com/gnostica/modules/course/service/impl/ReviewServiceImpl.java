package com.gnostica.modules.course.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Review;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.EnrollmentRepository;
import com.gnostica.core.repository.ReviewRepository;
import com.gnostica.modules.course.dto.request.ReviewReplyRequest;
import com.gnostica.modules.course.dto.request.ReviewRequest;
import com.gnostica.modules.course.dto.response.CourseReviewResponse;
import com.gnostica.modules.course.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourseRepository courseRepository;
    private final AccountRepository accountRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    public void submitReview(ReviewRequest request, String email) {
        Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(request.getCourseSlug())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        boolean isEnrolled = enrollmentRepository.findByAccountAndCourse(account, course).isPresent();
        if (!isEnrolled) {
            throw new IllegalArgumentException("You must be enrolled in the course to submit a review");
        }

        Optional<Review> existingReview = reviewRepository.findByAccountAndCourseAndParentIsNull(account, course);
        if (existingReview.isPresent()) {
            Review review = existingReview.get();
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            reviewRepository.save(review);
        } else {
            Review review = Review.builder()
                    .account(account)
                    .course(course)
                    .rating(request.getRating())
                    .comment(request.getComment())
                    .status(1) // 1: Published
                    .build();
            reviewRepository.save(review);
        }
    }

    @Override
    public void replyToReview(ReviewReplyRequest request, String email) {
        Account account = accountRepository.findByEmail(email.toLowerCase().trim()).or(() -> accountRepository.findByEmail(email))
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        Review parentReview = reviewRepository.findById(request.getParentReviewId())
                .orElseThrow(() -> new IllegalArgumentException("Parent review not found"));

        Review reply = Review.builder()
                .account(account)
                .course(parentReview.getCourse())
                .parent(parentReview)
                .rating(5) // Rating constraint is min 1, using 5 for reply since rating is not really applicable to reply
                .comment(request.getComment())
                .status(1)
                .build();
        reviewRepository.save(reply);
    }

    @Override
    public Map<String, Object> getCourseReviews(String slug) {
        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        List<Review> allReviews = reviewRepository.findByCourseAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(course, 1);

        List<Review> rootReviews = allReviews.stream()
                .filter(r -> r.getParent() == null)
                .collect(Collectors.toList());

        int reviewCount = rootReviews.size();
        double averageRating = 0;
        Map<Integer, Integer> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0);
        }

        if (reviewCount > 0) {
            for (Review r : rootReviews) {
                averageRating += r.getRating();
                distribution.put(r.getRating(), distribution.get(r.getRating()) + 1);
            }
            averageRating = averageRating / reviewCount;
            // Round to 1 decimal place
            averageRating = Math.round(averageRating * 10.0) / 10.0;
        }

        UUID instructorId = course.getAccount().getId();

        List<CourseReviewResponse> reviewsList = buildReviewTree(allReviews, instructorId, null);

        List<Map<String, Object>> distributionList = new ArrayList<>();
        for (int i = 5; i >= 1; i--) {
            Map<String, Object> distMap = new HashMap<>();
            distMap.put("rating", i);
            int count = distribution.get(i);
            distMap.put("count", count);
            distMap.put("percentage", reviewCount > 0 ? (int) Math.round(((double) count / reviewCount) * 100) : 0);
            distributionList.add(distMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("averageRating", averageRating);
        result.put("reviewCount", reviewCount);
        result.put("distribution", distributionList);
        result.put("reviews", reviewsList);

        return result;
    }

    private List<CourseReviewResponse> buildReviewTree(List<Review> allReviews, UUID instructorId, Review parent) {
        return allReviews.stream()
                .filter(r -> {
                    if (parent == null) {
                        return r.getParent() == null;
                    } else {
                        return r.getParent() != null && r.getParent().getId().equals(parent.getId());
                    }
                })
                .sorted(Comparator.comparing(Review::getCreatedAt))
                .map(r -> {
                    CourseReviewResponse response = mapToResponse(r, instructorId);
                    response.setReplies(buildReviewTree(allReviews, instructorId, r));
                    return response;
                })
                .collect(Collectors.toList());
    }

    private CourseReviewResponse mapToResponse(Review review, UUID instructorId) {
        return CourseReviewResponse.builder()
                .id(review.getId())
                .accountId(review.getAccount().getId())
                .studentName(review.getAccount().getFullName())
                .studentAvatar(review.getAccount().getAvatar())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .isInstructor(review.getAccount().getId().equals(instructorId))
                .build();
    }

    @Override
    public void updateReview(Integer id, String content, String email) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        if (!review.getAccount().getEmail().equals(email)) {
            throw new IllegalArgumentException("Không có quyền sửa phản hồi này");
        }
        review.setComment(content);
        reviewRepository.save(review);
    }

    @Override
    public void deleteReview(Integer id, String email) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        if (!review.getAccount().getEmail().equals(email)) {
            throw new IllegalArgumentException("Không có quyền xóa phản hồi này");
        }
        // Soft delete
        review.setDeletedAt(java.time.LocalDateTime.now());
        reviewRepository.save(review);
    }
}
