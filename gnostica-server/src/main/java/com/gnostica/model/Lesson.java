package com.gnostica.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gnostica.listener.AuditListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Entity
@EntityListeners(AuditListener.class)
@Table(name = "lessons")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @NotBlank(message = "Mô tả nội dung bài học không được để trống")
    @Column(columnDefinition = "TEXT")
    private String content;

    @NotBlank(message = "Video bài học không được để trống")
    @Column(name = "video_url")
    private String videoUrl;

    private Integer status;

    @Column(columnDefinition = "boolean default false")
    private Boolean deleted = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "module_id")
    @JsonIgnore
    private Module module;

    @JsonIgnore
    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<LessonProgress> progresses;
}
