package com.gnostica.modules.integration.model.mongo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Hồ sơ học tập cá nhân hóa của học viên, lưu trên MongoDB.
 * Được cập nhật thông qua tương tác với Chatbox AI.
 */
@Document(collection = "user_learning_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLearningProfile {

    @Id
    private String id;

    /** References PostgreSQL Account.id (UUID as String) */
    @Indexed(unique = true)
    private String accountId;

    /** Tên đầy đủ học viên (cache để hiển thị nhanh) */
    private String fullName;

    /** Các chủ đề yêu thích: ["Java", "Spring Boot", "SQL"] */
    private List<String> favoriteTopics;

    /** Mục tiêu học tập: "Trở thành Backend Java Developer", "Thi IELTS 7.0"... */
    private String learningGoal;

    /**
     * Trình độ hiện tại:
     * "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
     */
    private String skillLevel;

    /** Các kỹ năng hoặc chủ đề còn yếu (từ điểm quiz thấp) */
    private List<String> weakSkills;

    /** Slug của khóa học đang học gần nhất */
    private String lastCourseSlug;

    /** Tiêu đề của khóa học đang học gần nhất */
    private String lastCourseTitle;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
