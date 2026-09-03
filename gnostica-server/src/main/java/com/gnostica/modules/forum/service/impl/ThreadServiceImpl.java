package com.gnostica.modules.forum.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Topic;
import com.gnostica.core.model.Thread;
import com.gnostica.core.model.Vote;
import com.gnostica.core.model.Hashtag;
import com.gnostica.core.model.ThreadHashtag;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.TopicRepository;
import com.gnostica.core.repository.ThreadRepository;
import com.gnostica.core.repository.VoteRepository;
import com.gnostica.core.repository.CommentRepository;
import com.gnostica.core.repository.ReportRepository;
import com.gnostica.core.repository.HashtagRepository;
import com.gnostica.core.repository.ThreadHashtagRepository;
import com.gnostica.modules.integration.service.CloudinaryService;
import com.gnostica.modules.forum.service.ThreadService;
import com.gnostica.core.util.AuthUtil;
import com.gnostica.modules.user.service.NotificationService;
import java.time.LocalDateTime;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.gnostica.core.security.AuthenticatedAccountProvider;
import com.gnostica.core.exception.ForbiddenException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;
import java.util.Objects;
import java.util.List;
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
    @Autowired
    private AuthenticatedAccountProvider authenticatedAccountProvider;
    @Autowired
    private HashtagRepository hashtagRepository;
    @Autowired
    private ThreadHashtagRepository threadHashtagRepository;
    @Autowired
    private NotificationService notificationService;

    private String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) return "thao-luan";
        String str = input.trim();
        str = str.replaceAll("đ", "d").replaceAll("Đ", "D");
        str = java.text.Normalizer.normalize(str, java.text.Normalizer.Form.NFD);
        str = str.replaceAll("\\p{M}", "");
        str = str.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-+|-+$", "");
        return str.isEmpty() ? "thao-luan" : str;
    }

    private String generateUniqueSlug(String title, Integer excludeId) {
        String baseSlug = toSlug(title);
        String slug = baseSlug;
        int count = 1;
        while (true) {
            Optional<Thread> existing = threadRepository.findBySlug(slug);
            if (existing.isEmpty() || (excludeId != null && existing.get().getId().equals(excludeId))) {
                break;
            }
            slug = baseSlug + "-" + count;
            count++;
        }
        return slug;
    }

    @Override
    @Transactional
    public Thread createThread(String title, String content, Integer topicId, String authorEmail, List<MultipartFile> images, List<String> hashtags) {
        Account account = accountRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + authorEmail));

        Topic topic = null;
        if (topicId != null) {
            topic = topicRepository.findById(topicId)
                    .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));
        }

        Thread thread = new Thread();
        thread.setTitle(title != null && !title.trim().isEmpty() ? title : "Thảo luận");
        thread.setSlug(generateUniqueSlug(thread.getTitle(), null));
        thread.setContent(content);
        thread.setAccount(account);
        thread.setTopic(topic);
        
        // Newly created threads require moderation (Status 1 = Pending) so they appear in Admin Thread Moderation
        thread.setStatus(1); // 1 = Draft/Pending moderation, 2 = Published
        
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

        // Process uploaded MultipartFile images (e.g. from Mobile app or image attachments)
        if (images != null && !images.isEmpty()) {
            StringBuilder contentWithImages = new StringBuilder(thread.getContent() != null ? thread.getContent() : "");
            for (MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    try {
                        String uploadedUrl = cloudinaryService.uploadImage(file.getBytes());
                        if (uploadedUrl != null && !uploadedUrl.trim().isEmpty()) {
                            contentWithImages.append("<p><img src=\"").append(uploadedUrl).append("\" alt=\"attachment\" /></p>");
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }
            thread.setContent(contentWithImages.toString());
        }

        Thread savedThread = threadRepository.save(thread);

        // Save hashtags
        if (hashtags != null && !hashtags.isEmpty()) {
            for (String tag : hashtags) {
                String cleanTag = tag.trim().toLowerCase().replaceAll("[^a-z0-9_\\u00c0-\\u024f]", "");
                if (cleanTag.isEmpty()) continue;
                Hashtag hashtag = hashtagRepository.findByName(cleanTag)
                        .orElseGet(() -> {
                            Hashtag newTag = new Hashtag();
                            newTag.setName(cleanTag);
                            newTag.setUsageCount(0);
                            newTag.setStatus(1);
                            return hashtagRepository.save(newTag);
                        });
                // Increment usage count
                hashtag.setUsageCount((hashtag.getUsageCount() == null ? 0 : hashtag.getUsageCount()) + 1);
                hashtagRepository.save(hashtag);

                ThreadHashtag threadHashtag = new ThreadHashtag();
                threadHashtag.setThread(savedThread);
                threadHashtag.setHashtag(hashtag);
                threadHashtagRepository.save(threadHashtag);
            }
        }

        populateThreadStats(savedThread);
        return savedThread;
    }

    @Override
    public Page<Thread> getAllThreads(Pageable pageable) {
        return populateThreadsStats(threadRepository.findAllByStatus(2, pageable)); // 2 = Published
    }

    @Override
    @Transactional
    public Thread getThreadById(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        populateThreadStats(thread);
        return thread;
    }

    @Override
    @Transactional
    public Thread getThreadBySlug(String slug) {
        Thread thread = threadRepository.findBySlug(slug)
                .orElseGet(() -> {
                    try {
                        Integer id = Integer.parseInt(slug);
                        return threadRepository.findById(id).orElse(null);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                });
        if (thread == null) {
            throw new RuntimeException("Thread not found with slug: " + slug);
        }
        populateThreadStats(thread);
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
            newVote.setTargetType("THREAD");
            newVote.setType(1); // 1 for Thread
            newVote.setValue(true); // true for like
            voteRepository.save(newVote);
        }
        
        populateThreadStats(thread);
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
            
            // Calculate total likes for this account (only published threads)
            long totalLikes = 0;
            List<Thread> userThreads = threadRepository.findByAccountEmailAndStatusOrderByCreatedAtDesc(account.getEmail(), 2, PageRequest.of(0, 1000)).getContent();
            for (Thread t : userThreads) {
                totalLikes += voteRepository.countByTargetIdAndTypeAndValue(t.getId().toString(), 1, true);
            }
            
            map.put("totalLikes", totalLikes);
            map.put("threadCount", threadCount);
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public List<Thread> getRelatedThreads(Integer topicId, Integer currentThreadId) {
        if (topicId == null) {
            return new ArrayList<>();
        }
        return populateThreadsStats(
            threadRepository.findTop5ByTopic_IdAndStatusAndIdNotOrderByViewCountDesc(topicId, 2, currentThreadId)
        );
    }

    @Override
    public Page<Thread> getThreadsByEmail(String email, Pageable pageable) {
        return populateThreadsStats(threadRepository.findByAccountEmailOrderByCreatedAtDesc(email, pageable));
    }

    @Override
    @Transactional
    public Page<Thread> getLikedThreadsByEmail(String email, Pageable pageable) {
        List<Vote> likedVotes = voteRepository.findByAccountEmailAndType(email, 1); // 1 = Like
        List<Integer> threadIds = likedVotes.stream()
                .map(v -> {
                    try {
                        return Integer.parseInt(v.getTargetId());
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (threadIds.isEmpty()) {
            return Page.empty();
        }

        return populateThreadsStats(threadRepository.findByIdIn(threadIds, pageable));
    }

    @Override
    public Map<String, Object> getUserStats(String email) {
        Map<String, Object> response = new HashMap<>();
        Account account = accountRepository.findByEmail(email).orElse(null);
        if (account == null) {
            response.put("threadCount", 0);
            response.put("totalLikes", 0);
            return response;
        }

        // Only count published threads (status = 2)
        Page<Thread> threadsPage = threadRepository.findByAccountEmailAndStatusOrderByCreatedAtDesc(email, 2, PageRequest.of(0, 1000));
        long threadCount = threadsPage.getTotalElements();
        
        long totalLikes = 0;
        for (Thread t : threadsPage.getContent()) {
            totalLikes += voteRepository.countByTargetIdAndTypeAndValue(t.getId().toString(), 1, true);
        }

        response.put("threadCount", threadCount);
        response.put("totalLikes", totalLikes);
        return response;
    }

    @Override
    @Transactional
    public void deleteThread(Integer id) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));

        Account currentUser = authenticatedAccountProvider.requireCurrentAccount();
        boolean isAdmin = currentUser.getRole().getName() != null && currentUser.getRole().getName().toUpperCase().contains("ADMIN");
        boolean isAuthor = thread.getAccount() != null && thread.getAccount().getEmail().equals(currentUser.getEmail());

        if (!isAdmin && !isAuthor) {
            throw new ForbiddenException("Bạn không có quyền xóa bài viết này.");
        }

        voteRepository.deleteByTargetIdAndType(id.toString(), 1);
        reportRepository.deleteByTargetIdAndTargetType(id.toString(), "THREAD");
        commentRepository.deleteByTargetTypeAndTargetId("THREAD", id.toString());
        threadRepository.delete(thread);
    }

    @Override
    @Transactional
    public void rejectThread(Integer id, String reason) {
        Account currentUser = authenticatedAccountProvider.requireCurrentAccount();
        boolean isAdmin = currentUser.getRole().getName() != null && currentUser.getRole().getName().toUpperCase().contains("ADMIN");
        if (!isAdmin) {
            throw new ForbiddenException("Chỉ có Admin mới có quyền từ chối bài viết.");
        }

        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));

        if (thread.getAccount() != null) {
            String title = "Bài viết \"" + thread.getTitle() + "\" bị từ chối";
            String content = "Bài viết \"" + thread.getTitle() + "\" của bạn đã bị từ chối duyệt. Lý do: " + reason;
            notificationService.createNotification(thread.getAccount(), title, content, "FORUM_REJECT");
        }

        thread.setStatus(3); // 3 = Rejected
        threadRepository.save(thread);
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
        Account currentUser = authenticatedAccountProvider.requireCurrentAccount();
        boolean isAdmin = currentUser.getRole().getName() != null && currentUser.getRole().getName().toUpperCase().contains("ADMIN");
        if (!isAdmin) {
            throw new ForbiddenException("Chỉ có Admin mới có quyền xem danh sách chờ duyệt.");
        }
        return populateThreadsStats(threadRepository.findAllByStatus(1, pageable)); // 1 = Draft/Pending
    }

    @Override
    @Transactional
    public Thread approveThread(Integer id) {
        Account currentUser = authenticatedAccountProvider.requireCurrentAccount();
        boolean isAdmin = currentUser.getRole().getName() != null && currentUser.getRole().getName().toUpperCase().contains("ADMIN");
        if (!isAdmin) {
            throw new ForbiddenException("Chỉ có Admin mới có quyền duyệt bài viết.");
        }

        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        thread.setStatus(2); // Published
        Thread saved = threadRepository.save(thread);
        populateThreadStats(saved);
        return saved;
    }

    @Override
    @Transactional
    public Thread voteThread(Integer id, String userEmail, Integer voteValue) {
        Thread thread = threadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thread not found with id: " + id));
        Account account = accountRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + userEmail));

        String threadIdStr = id.toString();
        Optional<Vote> existingVoteOpt = voteRepository.findByAccountAndTargetIdAndType(account, threadIdStr, 2);

        if (voteValue == 1) { // Upvote
            if (existingVoteOpt.isPresent()) {
                Vote existingVote = existingVoteOpt.get();
                if (existingVote.getValue()) { // already upvoted, so remove it
                    voteRepository.delete(existingVote);
                } else { // was downvoted, change to upvote
                    existingVote.setValue(true);
                    voteRepository.save(existingVote);
                }
            } else { // create new upvote
                Vote newVote = new Vote();
                newVote.setAccount(account);
                newVote.setTargetId(threadIdStr);
                newVote.setTargetType("THREAD");
                newVote.setType(2); // 2 for Upvote/Downvote
                newVote.setValue(true); // true for Upvote
                voteRepository.save(newVote);
            }
        } else if (voteValue == -1) { // Downvote
            if (existingVoteOpt.isPresent()) {
                Vote existingVote = existingVoteOpt.get();
                if (!existingVote.getValue()) { // already downvoted, so remove it
                    voteRepository.delete(existingVote);
                } else { // was upvoted, change to downvote
                    existingVote.setValue(false);
                    voteRepository.save(existingVote);
                }
            } else { // create new downvote
                Vote newVote = new Vote();
                newVote.setAccount(account);
                newVote.setTargetId(threadIdStr);
                newVote.setTargetType("THREAD");
                newVote.setType(2); // 2 for Upvote/Downvote
                newVote.setValue(false); // false for Downvote
                voteRepository.save(newVote);
            }
        } else { // 0 or other: clear/delete vote
            if (existingVoteOpt.isPresent()) {
                voteRepository.delete(existingVoteOpt.get());
            }
        }

        populateThreadStats(thread);
        return thread;
    }

    @Override
    public Integer getVoteStatus(Integer id, String userEmail) {
        if (userEmail == null || userEmail.isEmpty()) return 0;
        Account account = accountRepository.findByEmail(userEmail).orElse(null);
        if (account == null) return 0;

        Optional<Vote> currentVoteOpt = voteRepository.findByAccountAndTargetIdAndType(account, id.toString(), 2);
        if (currentVoteOpt.isPresent()) {
            return currentVoteOpt.get().getValue() ? 1 : -1;
        }
        return 0;
    }

    private void populateThreadStats(Thread thread) {
        if (thread == null) return;
        String threadIdStr = thread.getId().toString();
        
        // Count likes (type = 1, value = true)
        long likesCount = voteRepository.countByTargetIdAndTypeAndValue(threadIdStr, 1, true);
        thread.setLikes(likesCount);

        // Count comments
        long commentCount = commentRepository.countByTargetTypeAndTargetId("THREAD", thread.getId().toString());
        thread.setCommentCount(commentCount);

        // Count votes (type = 2)
        long upvotes = voteRepository.countByTargetIdAndTypeAndValue(threadIdStr, 2, true);
        long downvotes = voteRepository.countByTargetIdAndTypeAndValue(threadIdStr, 2, false);
        thread.setVoteScore(upvotes - downvotes);

        // Check current logged-in user vote status
        String userEmail = AuthUtil.getCurrentUserEmail();
        if (userEmail != null && !userEmail.isEmpty()) {
            Account account = accountRepository.findByEmail(userEmail).orElse(null);
            if (account != null) {
                Optional<Vote> currentVoteOpt = voteRepository.findByAccountAndTargetIdAndType(account, threadIdStr, 2);
                if (currentVoteOpt.isPresent()) {
                    thread.setUserVote(currentVoteOpt.get().getValue() ? 1 : -1);
                } else {
                    thread.setUserVote(0);
                }
                thread.setUserLiked(voteRepository.existsByAccountAndTargetIdAndType(account, threadIdStr, 1));
            } else {
                thread.setUserVote(0);
                thread.setUserLiked(false);
            }
        } else {
            thread.setUserVote(0);
            thread.setUserLiked(false);
        }
    }

    private Page<Thread> populateThreadsStats(Page<Thread> threadsPage) {
        if (threadsPage != null) {
            threadsPage.forEach(this::populateThreadStats);
        }
        return threadsPage;
    }

    private List<Thread> populateThreadsStats(List<Thread> threadsList) {
        if (threadsList != null) {
            threadsList.forEach(this::populateThreadStats);
        }
        return threadsList;
    }

    // Automatically delete rejected threads that are older than 24 hours
    @Scheduled(cron = "0 0 * * * *") // Runs every hour
    @Transactional
    public void deleteExpiredRejectedThreads() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        List<Thread> expiredThreads = threadRepository.findAllByStatusAndUpdatedAtBefore(3, cutoff);
        for (Thread thread : expiredThreads) {
            voteRepository.deleteByTargetIdAndType(thread.getId().toString(), 1);
            reportRepository.deleteByTargetIdAndTargetType(thread.getId().toString(), "THREAD");
            commentRepository.deleteByTargetTypeAndTargetId("THREAD", thread.getId().toString());
            threadRepository.delete(thread);
        }
    }
}
