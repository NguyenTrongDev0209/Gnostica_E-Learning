package com.gnostica.modules.forum.service;
import com.gnostica.service.*;

import com.gnostica.core.model.Thread;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Map;
import java.util.List;

public interface ThreadService {
    Thread createThread(String content, Integer categoryId, String authorEmail, List<MultipartFile> images);
    Page<Thread> getAllThreads(Pageable pageable);
    Thread getThreadById(Integer id);
    Thread likeThread(Integer id, String userEmail);
    boolean hasLiked(Integer id, String userEmail);
    List<Map<String, Object>> getTopContributors();
    List<Thread> getRelatedThreads(Integer categoryId, Integer currentThreadId);
    Page<Thread> getThreadsByEmail(String email, Pageable pageable);
    Map<String, Object> getUserStats(String email);
    void deleteThread(Integer id);
    void incrementView(Integer id);
    Page<Thread> getPendingThreads(Pageable pageable);
    Thread approveThread(Integer id);
}
