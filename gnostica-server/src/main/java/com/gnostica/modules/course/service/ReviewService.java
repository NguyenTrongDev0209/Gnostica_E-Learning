package com.gnostica.modules.course.service;

import com.gnostica.modules.course.dto.request.ReviewRequest;
import com.gnostica.modules.course.dto.request.ReviewReplyRequest;
import java.util.Map;

public interface ReviewService {
    void submitReview(ReviewRequest request, String email);
    void replyToReview(ReviewReplyRequest request, String email);
    Map<String, Object> getCourseReviews(String slug);
    void updateReview(Integer id, String content, String email);
    void deleteReview(Integer id, String email);
}
