package com.gnostica.modules.forum.controller;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Topic;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.core.repository.TopicRepository;
import com.gnostica.modules.forum.dto.request.ForumCategoryRequest;
import com.gnostica.modules.forum.dto.response.ForumCategoryResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum-categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ForumCategoryController {

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping
    public ResponseEntity<List<ForumCategoryResponse>> getAll() {
        List<Topic> topics = topicRepository.findByDeletedAtIsNull();
        List<ForumCategoryResponse> response = topics.stream().map(topic -> {
            long count = threadRepository.countByTopic_Id(topic.getId());
            return ForumCategoryResponse.builder()
                    .id(topic.getId())
                    .name(topic.getTitle())
                    .slug(topic.getSlug())
                    .description(topic.getDescription())
                    .avatarUrl(topic.getAvatarUrl())
                    .bannerUrl(topic.getBannerUrl())
                    .status(topic.getStatus() != null && topic.getStatus() == 1)
                    .threadCount(count)
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'INSTRUCTOR', 'ROLE_INSTRUCTOR')")
    public ResponseEntity<?> create(@Valid @RequestBody ForumCategoryRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Account account = accountRepository.findByEmail(email).orElse(null);

        Topic topic = Topic.builder()
                .title(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .avatarUrl(request.getAvatarUrl())
                .bannerUrl(request.getBannerUrl())
                .status(request.getStatus() != null && request.getStatus() ? 1 : 0)
                .account(account)
                .build();

        Topic saved = topicRepository.save(topic);
        return ResponseEntity.ok(ForumCategoryResponse.builder()
                .id(saved.getId())
                .name(saved.getTitle())
                .slug(saved.getSlug())
                .description(saved.getDescription())
                .avatarUrl(saved.getAvatarUrl())
                .bannerUrl(saved.getBannerUrl())
                .status(saved.getStatus() == 1)
                .threadCount(0L)
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'INSTRUCTOR', 'ROLE_INSTRUCTOR')")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody ForumCategoryRequest request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setTitle(request.getName());
        topic.setSlug(request.getSlug());
        topic.setDescription(request.getDescription());
        topic.setAvatarUrl(request.getAvatarUrl());
        topic.setBannerUrl(request.getBannerUrl());
        if (request.getStatus() != null) {
            topic.setStatus(request.getStatus() ? 1 : 0);
        }

        Topic saved = topicRepository.save(topic);
        long count = threadRepository.countByTopic_Id(saved.getId());
        return ResponseEntity.ok(ForumCategoryResponse.builder()
                .id(saved.getId())
                .name(saved.getTitle())
                .slug(saved.getSlug())
                .description(saved.getDescription())
                .avatarUrl(saved.getAvatarUrl())
                .bannerUrl(saved.getBannerUrl())
                .status(saved.getStatus() == 1)
                .threadCount(count)
                .build());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'INSTRUCTOR', 'ROLE_INSTRUCTOR')")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody Map<String, Boolean> payload) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        Boolean status = payload.get("status");
        if (status != null) {
            topic.setStatus(status ? 1 : 0);
        }
        topicRepository.save(topic);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'INSTRUCTOR', 'ROLE_INSTRUCTOR')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Topic not found"));
        topic.setDeletedAt(LocalDateTime.now());
        topicRepository.save(topic);
        return ResponseEntity.ok().build();
    }
}
