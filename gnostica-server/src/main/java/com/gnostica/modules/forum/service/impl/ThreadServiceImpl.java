package com.gnostica.modules.forum.service.impl;
import com.gnostica.service.*;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.ForumCategory;
import com.gnostica.core.model.Thread;
import com.gnostica.core.model.ThreadImage;
import com.gnostica.core.model.ThreadLike;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.ForumCategoryRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.core.repository.ThreadLikeRepository;
import com.gnostica.core.repository.CommentRepository;
import com.gnostica.core.repository.ThreadReportRepository;
import com.gnostica.service.CloudinaryService;
import com.gnostica.modules.forum.service.ThreadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class ThreadServiceImpl implements ThreadService {

    @Autowired
    private ThreadRepository threadRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ForumCategoryRepository forumCategoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ThreadLikeRepository threadLikeRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ThreadReportRepository threadReportRepository;

    @Override
    @Transactional
    public Thread createThread(String content, Integer categoryId, String authorEmail, List<MultipartFile> images) {
        // Find Account by email
        Account account = accountRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + authorEmail));

        // Find Category if provided
        ForumCategory category = null;
        if (categoryId != null) {
            category = forumCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("ForumCategory not found with id: " + categoryId));
        }

        // Create Thread entity
        Thread thread = new Thread();
        thread.setContent(content);
        thread.setAccount(account);
        thread.setCategory(category);
        thread.setStatus(false); // Pending moderation by default
        
        // Handle image uploads
        if (images != null && !images.isEmpty()) {
            List<ThreadImage> threadImages = new ArrayList<>();
            for (MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String imageUrl = cloudinaryService.uploadImage(file);
                        ThreadImage threadImage = new ThreadImage();
                        threadImage.setImageUrl(imageUrl);
                        threadImage.setThread(thread); // Set bidirectional relationship
                        threadImages.add(threadImage);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to upload image to Cloudinary", e);
                    }
                }
            }
            thread.setImages(threadImages);
        }

        return threadRepository.save(thread);
    }

    @Override
    public Page<Thread> getAllThreads(Pageable pageable) {
        return threadRepository.findAllByStatusTrue(pageable);
    }

    @Override
    @Transactional
    public Thread getThreadById(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        
        // Luôn cập nhật số lượng bình luận thực tế từ bảng comments
        long actualCommentCount = commentRepository.countByObjectId(String.valueOf(id));
        thread.setCommentCount((int) actualCommentCount);

        // (Xóa logic tăng views ở đây để tránh bị double count khi gọi API liên quan)
        
        return threadRepository.save(thread);
    }

    @Override
    @Transactional
    public Thread likeThread(Integer id, String userEmail) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        Account account = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + userEmail));
        
        Optional<ThreadLike> existingLike = threadLikeRepository.findByThreadAndAccount(thread, account);
        
        Integer currentLikes = thread.getLikes();
        if (currentLikes == null) currentLikes = 0;

        if (existingLike.isPresent()) {
            // Đã like -> Bỏ like (Toggle off)
            threadLikeRepository.delete(existingLike.get());
            thread.setLikes(Math.max(0, currentLikes - 1));
        } else {
            // Chưa like -> Thêm like (Toggle on)
            ThreadLike newLike = new ThreadLike();
            newLike.setThread(thread);
            newLike.setAccount(account);
            threadLikeRepository.save(newLike);
            thread.setLikes(currentLikes + 1);
        }
        
        return threadRepository.save(thread);
    }

    @Override
    public boolean hasLiked(Integer id, String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) return false;
        
        Thread thread = threadRepository.findById(id).orElse(null);
        Account account = accountRepository.findByEmail(userEmail).orElse(null);
        
        if (thread == null || account == null) return false;
        return threadLikeRepository.existsByThreadAndAccount(thread, account);
    }

    @Override
    public List<Map<String, Object>> getTopContributors() {
        List<Object[]> results = threadRepository.findTopContributors(PageRequest.of(0, 3));
        return results.stream().map(result -> {
            com.gnostica.core.model.Account account = (com.gnostica.core.model.Account) result[0];
            Long totalLikes = (Long) result[1];
            Long threadCount = (Long) result[2];
            Map<String, Object> map = new HashMap<>();
            map.put("account", account);
            map.put("totalLikes", totalLikes);
            map.put("threadCount", threadCount);
            return map;
        }).collect(Collectors.toList());
    }
    @Override
    public List<Thread> getRelatedThreads(Integer categoryId, Integer currentThreadId) {
        if (categoryId == null) {
            return new ArrayList<>();
        }
        return threadRepository.findTop3ByCategoryIdAndIdNotAndStatusTrueOrderByLikesDesc(categoryId, currentThreadId);
    }

    @Override
    public Page<Thread> getThreadsByEmail(String email, Pageable pageable) {
        return threadRepository.findByAccountEmailOrderByCreatedAtDesc(email, pageable);
    }

    @Override
    public Map<String, Object> getUserStats(String email) {
        Object[] statsArray = threadRepository.getUserStats(email);
        if (statsArray == null || statsArray.length == 0) {
            Map<String, Object> response = new HashMap<>();
            response.put("threadCount", 0);
            response.put("totalLikes", 0);
            return response;
        }
        Object[] stats = (Object[]) statsArray[0];
        Map<String, Object> response = new HashMap<>();
        response.put("threadCount", stats[0]);
        response.put("totalLikes", stats[1]);
        return response;
    }

    @Override
    @Transactional
    public void deleteThread(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));

        // 1. Delete associated ThreadLikes
        threadLikeRepository.deleteByThreadId(id);

        // 2. Delete associated ThreadReports
        threadReportRepository.deleteByThreadId(id);

        // 3. Delete associated Comments (objectId is thread id as string)
        commentRepository.deleteByObjectId(id.toString());

        // 4. Delete associated images (handled by CascadeType.ALL + orphanRemoval = true in entity)
        
        // 5. Delete the thread
        threadRepository.delete(thread);
    }

    @Override
    @Transactional
    public void incrementView(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        
        Integer currentViews = thread.getViews();
        thread.setViews((currentViews == null ? 0 : currentViews) + 1);
        threadRepository.save(thread);
    }

    @Override
    public Page<Thread> getPendingThreads(Pageable pageable) {
        return threadRepository.findAllByStatusFalse(pageable);
    }

    @Override
    @Transactional
    public Thread approveThread(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        thread.setStatus(true);
        thread.setPendingModeration(false);
        return threadRepository.save(thread);
    }
}
