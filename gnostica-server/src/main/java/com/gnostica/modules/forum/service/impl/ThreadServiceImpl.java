package com.gnostica.modules.forum.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Topic;
import com.gnostica.core.model.Thread;
import com.gnostica.core.model.Vote;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.TopicRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.core.repository.VoteRepository;
import com.gnostica.core.repository.CommentRepository;
import com.gnostica.core.repository.ReportRepository;
import com.gnostica.modules.integration.service.CloudinaryService;
import com.gnostica.modules.forum.service.ThreadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class ThreadServiceImpl implements ThreadService {

    @Autowired
    private ThreadRepository threadRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private CloudinaryService cloudinaryService;
    @Autowired
    private VoteRepository voteRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private ReportRepository reportRepository;

    private String toSlug(String input) {
        if (input == null) return "";
        return input.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("-$", "").replaceAll("^-", "");
    }

    @Override
    @Transactional
    public Thread createThread(String title, String content, Integer topicId, String authorEmail, List<MultipartFile> images) {
        Account account = accountRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + authorEmail));

        Topic topic = null;
        if (topicId != null) {
            topic = topicRepository.findById(topicId)
                    .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));
        }

        Thread thread = new Thread();
        thread.setTitle(title != null ? title : "Untitled");
        thread.setSlug(toSlug(thread.getTitle()) + "-" + System.currentTimeMillis());
        thread.setContent(content);
        thread.setAccount(account);
        thread.setTopic(topic);
        thread.setStatus(1); // 1 = Draft or Pending
        thread.setViewCount(0);
        thread.setSharedCount(0);
        thread.setIsLocked(false);
        thread.setIsPinned(false);

        // Upload Base64 in content
        if (content != null && !content.isEmpty()) {
            Pattern pattern = Pattern.compile("data:image/(jpeg|png|gif|webp|jpg);base64,([^\"']*)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(content);
            StringBuffer sb = new StringBuffer();
            while (matcher.find()) {
                String base64Data = matcher.group(2).replaceAll("\\s", "");
                try {
                    byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
                    String uploadedUrl = cloudinaryService.uploadImage(imageBytes);
                    matcher.appendReplacement(sb, Matcher.quoteReplacement(uploadedUrl));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            matcher.appendTail(sb);
            thread.setContent(sb.toString());
        }

        return threadRepository.save(thread);
    }

    @Override
    public Page<Thread> getAllThreads(Pageable pageable) {
        return threadRepository.findAllByStatus(2, pageable); // 2 = Published
    }

    @Override
    @Transactional
    public Thread getThreadById(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        return thread;
    }

    @Override
    @Transactional
    public Thread likeThread(Integer id, String userEmail) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        Account account = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + userEmail));
        
        Optional<Vote> existingVote = voteRepository.findByAccountAndTargetIdAndType(account, id.toString(), 1);
        
        if (existingVote.isPresent()) {
            voteRepository.delete(existingVote.get());
        } else {
            Vote newVote = new Vote();
            newVote.setAccount(account);
            newVote.setTargetId(id.toString());
            newVote.setType(1); // 1 for Thread
            newVote.setValue(true); // true for like
            voteRepository.save(newVote);
        }
        
        return thread;
    }

    @Override
    public boolean hasLiked(Integer id, String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) return false;
        Account account = accountRepository.findByEmail(userEmail).orElse(null);
        if (account == null) return false;
        return voteRepository.existsByAccountAndTargetIdAndType(account, id.toString(), 1);
    }

    @Override
    public List<Map<String, Object>> getTopContributors() {
        List<Object[]> results = threadRepository.findTopContributors(PageRequest.of(0, 3));
        return results.stream().map(result -> {
            com.gnostica.core.model.Account account = (com.gnostica.core.model.Account) result[0];
            Long threadCount = (Long) result[1];
            Map<String, Object> map = new HashMap<>();
            map.put("account", account);
            map.put("totalLikes", 0);
            map.put("threadCount", threadCount);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public List<Thread> getRelatedThreads(Integer topicId, Integer currentThreadId) {
        if (topicId == null) {
            return new ArrayList<>();
        }
        return threadRepository.findTop5ByTopic_IdAndStatusOrderByViewCountDesc(topicId, 2); 
    }

    @Override
    public Page<Thread> getThreadsByEmail(String email, Pageable pageable) {
        return threadRepository.findByAccountEmailOrderByCreatedAtDesc(email, pageable);
    }

    @Override
    public Map<String, Object> getUserStats(String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("threadCount", 0);
        response.put("totalLikes", 0);
        return response;
    }

    @Override
    @Transactional
    public void deleteThread(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));

        voteRepository.deleteByTargetIdAndType(id.toString(), 1);
        reportRepository.deleteByTargetIdAndTargetType(id.toString(), "THREAD");
        commentRepository.deleteByThreadId(id);
        threadRepository.delete(thread);
    }

    @Override
    @Transactional
    public void incrementView(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        
        Integer currentViews = thread.getViewCount();
        thread.setViewCount((currentViews == null ? 0 : currentViews) + 1);
        threadRepository.save(thread);
    }

    @Override
    public Page<Thread> getPendingThreads(Pageable pageable) {
        return threadRepository.findAllByStatus(1, pageable); // 1 = Draft/Pending
    }

    @Override
    @Transactional
    public Thread approveThread(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        thread.setStatus(2); // Published
        return threadRepository.save(thread);
    }
}
