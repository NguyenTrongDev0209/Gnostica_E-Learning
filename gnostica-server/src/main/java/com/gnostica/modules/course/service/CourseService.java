package com.gnostica.modules.course.service;
import com.gnostica.modules.integration.service.BunnyNetService;


import com.gnostica.modules.course.dto.request.CourseRequest;
import com.gnostica.modules.course.dto.request.LessonRequest;
import com.gnostica.modules.course.dto.request.ModuleRequest;
import com.gnostica.modules.forum.dto.response.*;
import com.gnostica.modules.wallet.dto.response.*;
import com.gnostica.modules.dashboard.dto.response.*;
import com.gnostica.modules.order.dto.response.*;
import com.gnostica.modules.payment.dto.response.*;
import com.gnostica.modules.course.dto.response.*;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Attachment;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Lesson;
import com.gnostica.core.model.Module;
import com.gnostica.core.model.Quiz;
import com.gnostica.core.model.Question;
import com.gnostica.core.model.Review;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CategoryRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.LessonRepository;
import com.gnostica.core.repository.ReviewRepository;
import com.gnostica.modules.user.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final DraftCourseService draftCourseService;
    private final QuizService quizService;
    private final QuestionBankService questionBankService;
    private final LessonRepository lessonRepository;
    private final ReviewRepository reviewRepository;
    private final BunnyNetService bunnyNetService;
    private final NotificationService notificationService;

    @Transactional
    public Course createCourse(CourseRequest request, String email) {
        // 1. Fetch relations
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        // 2. Initialize Course Entity
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setSlug(generateUniqueSlug(request.getSlug(), course.getId()));
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());

        // Default values for numbers if null
        course.setPrice(java.math.BigDecimal.valueOf(request.getPrice() != null ? request.getPrice() : 0.0));
        course.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0);

        course.setLevel(request.getLevel() != null ? request.getLevel() : "Beginner");
        course.setMetadata(request.getMetadata());
        course.setPromoVideo(request.getPromoVideo());

        course.setCategory(category);
        course.setAccount(account);

        if (category.getStatus() == null || category.getStatus() == 0) {
            throw new RuntimeException("Danh mục cha đang bị ẩn, không thể tạo khóa học.");
        }

        // Default Status: 4 (Chờ duyệt)
        course.setStatus(4);
        course.setVersionNumber(1);
        course.setSharedCount(0); // Initialize shared count to 0

        // 3. Map Modules (Sections)
        List<Module> modules = new ArrayList<>();
        if (request.getSections() != null && !request.getSections().isEmpty()) {
            int moduleSortOrder = 1;
            for (ModuleRequest mReq : request.getSections()) {
                Module module = new Module();
                module.setTitle(mReq.getTitle());
                module.setStatus(mReq.getStatus() != null ? mReq.getStatus() : course.getStatus());
                module.setCourse(course);
                module.setMetadata(mReq.getMetadata());
                module.setVersionNumber(1);
                module.setSortOrder(moduleSortOrder++);

                // Handle string URL attachment mapped to single entity
                if (mReq.getAttachments() != null && !mReq.getAttachments().trim().isEmpty()) {
                    Attachment attachment = new Attachment();
                    attachment.setFileUrl(mReq.getAttachments());
                    attachment.setFileType("document");
                    attachment.setModule(module);

                    List<Attachment> moduleAttachments = new ArrayList<>();
                    moduleAttachments.add(attachment);
                    module.setAttachments(moduleAttachments);
                }

                // Handle Lessons inside Module
                List<Lesson> lessons = new ArrayList<>();
                if (mReq.getLessons() != null && !mReq.getLessons().isEmpty()) {
                    int lessonSortOrder = 1;
                    for (LessonRequest lReq : mReq.getLessons()) {
                        Lesson lesson = new Lesson();
                        lesson.setTitle(lReq.getTitle());
                        lesson.setContent(lReq.getContent());
                        lesson.setVideoUrl(lReq.getVideoUrl());
                        lesson.setMetadata(lReq.getMetadata());
                        lesson.setVersionNumber(1);
                        lesson.setSortOrder(lessonSortOrder++);
                        // Nếu khóa học đang ẩn thì bài học buộc phải ẩn
                        int finalLessonStatus = (course.getStatus() == 2) ? 2
                                : (lReq.getStatus() != null ? lReq.getStatus() : module.getStatus());
                        lesson.setStatus(finalLessonStatus);
                        lesson.setModule(module);
                        lessons.add(lesson);
                    }
                }
                module.setLessons(lessons);

                // Nếu khóa học đang ẩn thì chương buộc phải ẩn
                int finalModuleStatus = (course.getStatus() == 2) ? 2
                        : (mReq.getStatus() != null ? mReq.getStatus() : course.getStatus());
                module.setStatus(finalModuleStatus);
                modules.add(module);
            }
        }
        course.setModules(modules);

        // 4. Save and return
        Course savedCourse = courseRepository.save(course);

        // Save question bank first and get ID mapping
        java.util.Map<Integer, Integer> questionIdMap = new java.util.HashMap<>();
        if (request.getQuestionBank() != null) {
            questionIdMap = questionBankService.saveQuestionBankAndGetMap(savedCourse, request.getQuestionBank());
        }

        // Save associated quizzes for each module
        if (request.getSections() != null && savedCourse.getModules() != null) {
            for (int i = 0; i < request.getSections().size(); i++) {
                if (i < savedCourse.getModules().size()) {
                    ModuleRequest mReq = request.getSections().get(i);
                    Module savedModule = savedCourse.getModules().get(i);
                    if (mReq.getQuiz() != null) {
                        List<Integer> originalQuestionIds = mReq.getQuiz().getQuestionIds();
                        List<Integer> realQuestionIds = new ArrayList<>();
                        if (originalQuestionIds != null) {
                            for (Integer origId : originalQuestionIds) {
                                Integer realId = questionIdMap.get(origId);
                                if (realId != null) {
                                    realQuestionIds.add(realId);
                                } else {
                                    realQuestionIds.add(origId);
                                }
                            }
                        }
                        mReq.getQuiz().setQuestionIds(realQuestionIds);
                        quizService.saveQuizForModule(savedModule, mReq.getQuiz());
                    }
                }
            }
        }

        // 5. Clear Redis Draft
        draftCourseService.deleteDraft(email, null); // "new" draft

        return savedCourse;
    }

    @Transactional(readOnly = true)
    public CourseDetailResponse getCourseBySlug(String slug, String email) {
        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        // Kiểm tra xem user có phải là Instructor của khóa này hoặc Admin không
        boolean isOwner = email != null && course.getAccount().getEmail().equals(email);

        // Kiểm tra xem user có mua khóa học này chưa
        boolean isEnrolled = false;
        if (email != null && !isOwner) {
            Account account = accountRepository.findByEmail(email).orElse(null);
            if (account != null) {
                isEnrolled = course.getEnrollments().stream()
                        .anyMatch(e -> e.getAccount().getId().equals(account.getId()) && e.getStatus() == 1);
            }
        }
        // course.setIsEnrolled(isEnrolled);

        // Logic hiển thị:
        // 1. Nếu là khách (email null) hoặc chưa mua: Chỉ thấy nếu status = 1 (Hoạt
        // động) và chưa bị xóa
        if (!isOwner && !isEnrolled && (course.getStatus() != 1 || Boolean.TRUE.equals(course.getDeleted()))) {
            throw new RuntimeException("Khóa học hiện không khả dụng");
        }
        
        // Tuyệt chiêu bảo vệ dữ liệu:
        // CHỈ CÓ Học viên đã mua (isEnrolled = true) mới thấy được module/lesson bị xóa mềm.
        // Khách vãng lai VÀ Giảng viên (khi vào edit) sẽ không thấy các mục đã xóa nữa.
        if (!isEnrolled && course.getModules() != null) {
            course.getModules().removeIf(m -> Boolean.TRUE.equals(m.getDeleted()));
            for (Module m : course.getModules()) {
                if (m.getLessons() != null) {
                    m.getLessons().removeIf(l -> Boolean.TRUE.equals(l.getDeleted()));
                }
            }
        }

        // Tuy nhiên, các Module hoặc Lesson bị ẩn (status = 2) vẫn phải lọc bỏ
        // trừ khi là chủ sở hữu (Instructor) hoặc học viên đã mua khóa học muốn xem
        if (!isOwner && !isEnrolled) {
            if (course.getModules() != null) {
                course.getModules().removeIf(m -> m.getStatus() != 1);
                for (Module m : course.getModules()) {
                    if (m.getLessons() != null) {
                        m.getLessons().removeIf(l -> l.getStatus() != 1);
                    }
                }
            }
        }

        CourseDetailResponse response = mapToCourseDetailResponse(course);
        List<Review> publishedReviews = reviewRepository
                .findByCourseAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(course, 1);
        response.setReviewCount(publishedReviews.size());
        response.setRating(publishedReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0));
        response.setReviews(publishedReviews.stream()
                .map(review -> CourseReviewResponse.builder()
                        .id(review.getId())
                        .accountId(review.getAccount() != null ? review.getAccount().getId() : null)
                        .studentName(review.getAccount() != null ? review.getAccount().getFullName() : "Học viên")
                        .studentAvatar(review.getAccount() != null ? review.getAccount().getAvatar() : null)
                        .rating(review.getRating())
                        .comment(review.getComment())
                        .createdAt(review.getCreatedAt())
                        .build())
                .collect(Collectors.toList()));
        response.setIsEnrolled(isEnrolled);
        return response;
    }

    @Transactional
    public void deleteCourse(java.util.UUID id, String email) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (!course.getAccount().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền xóa khóa học này");
        }

        // Soft delete the course
        course.setDeleted(true);

        // Soft delete all modules and lessons
        if (course.getModules() != null) {
            for (Module m : course.getModules()) {
                m.setDeleted(true);
                if (m.getLessons() != null) {
                    for (Lesson l : m.getLessons()) {
                        l.setDeleted(true);
                    }
                }
            }
        }

        courseRepository.save(course);
    }

    @Transactional
    public CourseDetailResponse updateCourseBySlug(String slug, CourseRequest request, String email) {
        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (!course.getAccount().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa khóa học này");
        }

        // Versioning Logic: Nếu khóa học đã xuất bản (status = 1), tạo bản nháp mới (V2) thay vì đè lên bản chính
        boolean isCloning = false;
        if (course.getStatus() == 1) {
            // Kiểm tra xem đã có bản Draft nào của khóa này chưa
            Course existingDraft = courseRepository.findFirstByOriginalCourseAndDeletedAtIsNullOrderByIdDesc(course)
                    .orElse(null);
            if (existingDraft != null) {
                // Nếu đang có bản Draft, cập nhật thẳng vào bản Draft này
                course = existingDraft;
            } else {
                // Tạo một entity Course mới hoàn toàn (Draft V2)
                Course newDraft = new Course();
                newDraft.setOriginalCourse(course);
                newDraft.setVersionNumber(course.getVersionNumber() + 1);
                newDraft.setSharedCount(0); // Initialize shared count to 0
                newDraft.setAccount(course.getAccount());
                // Sinh slug mới cho bản Draft để không bị trùng (vd: slug-goc-v2)
                newDraft.setSlug(generateUniqueSlug(course.getSlug() + "-v" + (course.getVersionNumber() + 1), null));
                newDraft.setModules(new ArrayList<>());
                newDraft.setEnrollments(new ArrayList<>());
                course = newDraft;
                isCloning = true;
            }
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        // DỌN RÁC VIDEO (Lớp 4): Thu thập danh sách video CŨ
        List<String> oldVideoUrls = new ArrayList<>();
        if (course.getPromoVideo() != null && !course.getPromoVideo().isEmpty()) {
            oldVideoUrls.add(course.getPromoVideo());
        }
        if (course.getModules() != null) {
            for (Module m : course.getModules()) {
                if (!Boolean.TRUE.equals(m.getDeleted()) && m.getLessons() != null) {
                    for (Lesson l : m.getLessons()) {
                        if (!Boolean.TRUE.equals(l.getDeleted()) && l.getVideoUrl() != null && !l.getVideoUrl().isEmpty()) {
                            oldVideoUrls.add(l.getVideoUrl());
                        }
                    }
                }
            }
        }

        // Update basic info
        course.setTitle(request.getTitle());
        course.setSlug(generateUniqueSlug(request.getSlug(), course.getId()));
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        course.setPrice(request.getPrice() != null ? java.math.BigDecimal.valueOf(request.getPrice()) : java.math.BigDecimal.ZERO);
        course.setDiscount(request.getDiscount());

        course.setLevel(request.getLevel());
        course.setMetadata(request.getMetadata());
        course.setCategory(category);

        if (category.getStatus() == null || category.getStatus() == 0) {
            throw new RuntimeException("Danh mục cha đang bị ẩn, không thể cập nhật khóa học.");
        }

        // Khóa học chuyển về trạng thái Chờ duyệt sau khi sửa
        course.setStatus(4);
        // course.setRejectReason(null);
        course.setPromoVideo(request.getPromoVideo());

        // 3. Smart Update Modules
        List<Module> currentModules = course.getModules();
        List<ModuleRequest> requestedSections = request.getSections();
        // CHUYỂN SANG XÓA MỀM: Không clear() hay removeIf() nữa vì orphanRemoval sẽ xóa sạch DB.
        if (requestedSections == null) {
            currentModules.forEach(m -> m.setDeleted(true));
        } else {
            // Lọc các Module đang tồn tại trong DB nhưng KHÔNG nằm trong danh sách gửi lên -> Đánh dấu Deleted
            currentModules.stream()
                    .filter(existingModule -> existingModule.getId() != null && requestedSections.stream()
                            .noneMatch(req -> req.getId() != null && req.getId().equals(existingModule.getId())))
                    .forEach(m -> m.setDeleted(true));

            int moduleSortOrder = 1;
            for (ModuleRequest mReq : requestedSections) {
                Module module;
                boolean isNewModule = false;
                if (mReq.getId() != null) {
                    // Update existing
                    Module found = currentModules.stream()
                            .filter(m -> m.getId().equals(mReq.getId()))
                            .findFirst()
                            .orElse(null);
                    if (found != null) {
                        module = found;
                    } else {
                        module = new Module();
                        module.setCourse(course);
                        // Versioning: Ghi nhớ Module gốc
                        Module origMod = new Module();
                        origMod.setId(mReq.getId());
                        module.setOriginalModule(origMod);
                        module.setVersionNumber(course.getVersionNumber());
                        isNewModule = true;
                    }
                } else {
                    // Create new
                    module = new Module();
                    module.setCourse(course);
                    module.setVersionNumber(course.getVersionNumber());
                    isNewModule = true;
                }

                module.setTitle(mReq.getTitle());
                module.setMetadata(mReq.getMetadata());
                module.setSortOrder(moduleSortOrder++);
                module.setStatus(mReq.getStatus() != null ? mReq.getStatus() : course.getStatus());

                // Handle Attachments (Update or create single)
                if (mReq.getAttachments() != null && !mReq.getAttachments().trim().isEmpty()) {
                    if (module.getAttachments() == null)
                        module.setAttachments(new ArrayList<>());

                    if (module.getAttachments().isEmpty()) {
                        Attachment attachment = new Attachment();
                        attachment.setFileUrl(mReq.getAttachments());
                        attachment.setFileType("document");
                        attachment.setModule(module);
                        module.getAttachments().add(attachment);
                    } else {
                        module.getAttachments().get(0).setFileUrl(mReq.getAttachments());
                    }
                } else if (module.getAttachments() != null) {
                    module.getAttachments().clear();
                }

                // Handle Lessons (Sub-merge)
                if (module.getLessons() == null) {
                    module.setLessons(new ArrayList<>());
                }
                final List<Lesson> currentLessons = module.getLessons();

                List<LessonRequest> requestedLessons = mReq.getLessons();
                // Tương tự với Lesson: Chuyển sang XÓA MỀM cho từng lesson con
                if (requestedLessons == null) {
                    currentLessons.forEach(l -> l.setDeleted(true));
                } else {
                    currentLessons.stream()
                            .filter(existingLesson -> existingLesson.getId() != null && requestedLessons.stream()
                                    .noneMatch(req -> req.getId() != null && req.getId().equals(existingLesson.getId())))
                            .forEach(l -> l.setDeleted(true));

                    int lessonSortOrder = 1;
                    for (LessonRequest lReq : requestedLessons) {
                        Lesson lesson;
                        if (lReq.getId() != null) {
                            lesson = currentLessons.stream()
                                    .filter(l -> l.getId().equals(lReq.getId()))
                                    .findFirst()
                                    .orElse(null);
                            if (lesson == null) {
                                lesson = new Lesson();
                                lesson.setModule(module);
                                // Versioning: Ghi nhớ Lesson gốc
                                Lesson origLess = new Lesson();
                                origLess.setId(lReq.getId());
                                lesson.setOriginalLesson(origLess);
                                lesson.setVersionNumber(course.getVersionNumber());
                                currentLessons.add(lesson);
                            }
                        } else {
                            lesson = new Lesson();
                            lesson.setModule(module);
                            lesson.setVersionNumber(course.getVersionNumber());
                            currentLessons.add(lesson);
                        }
                        lesson.setTitle(lReq.getTitle());
                        lesson.setContent(lReq.getContent());
                        lesson.setVideoUrl(lReq.getVideoUrl());
                        lesson.setMetadata(lReq.getMetadata());
                        lesson.setSortOrder(lessonSortOrder++);

                        // Nếu khóa học đang ẩn thì bài học buộc phải ẩn
                        int finalLessonStatus = (course.getStatus() == 2) ? 2
                                : (lReq.getStatus() != null ? lReq.getStatus() : module.getStatus());
                        lesson.setStatus(finalLessonStatus);
                    }
                }

                // Nếu khóa học đang ẩn thì chương buộc phải ẩn
                int finalModuleStatus = (course.getStatus() == 2) ? 2
                        : (mReq.getStatus() != null ? mReq.getStatus() : course.getStatus());
                module.setStatus(finalModuleStatus);

                if (isNewModule) {
                    currentModules.add(module);
                }
            }
        }

        // Explicit validation to clearly inform the user WHICH module is causing the
        // issue
        // Xác thực dữ liệu: Bắt buộc mỗi chương (không bị xóa) phải có ít nhất 1 bài học (không bị xóa).
        for (Module m : course.getModules()) {
            if (Boolean.TRUE.equals(m.getDeleted())) continue; // Bỏ qua chương đã bị xóa mềm
            
            long activeLessonCount = (m.getLessons() == null) ? 0 : 
                m.getLessons().stream().filter(l -> !Boolean.TRUE.equals(l.getDeleted())).count();

            if (activeLessonCount == 0) {
                throw new RuntimeException("Lỗi dữ liệu: Chương '" + m.getTitle()
                        + "' không có bài học nào! Hệ thống bắt buộc mỗi chương phải có bài học. Vui lòng kiểm tra lại các chương cũ hoặc thêm bài học cho chương mới.");
            }
        }

        Course updatedCourse = courseRepository.save(course);

        // Save question bank first and get ID mapping
        java.util.Map<Integer, Integer> questionIdMap = new java.util.HashMap<>();
        if (request.getQuestionBank() != null) {
            questionIdMap = questionBankService.saveQuestionBankAndGetMap(updatedCourse, request.getQuestionBank());
        }

        // Save associated quizzes for each module in update
        if (requestedSections != null && updatedCourse.getModules() != null) {
            for (ModuleRequest mReq : requestedSections) {
                Module savedModule = null;
                if (mReq.getId() != null) {
                    savedModule = updatedCourse.getModules().stream()
                            .filter(m -> m.getId().equals(mReq.getId()))
                            .findFirst()
                            .orElse(null);
                } else {
                    // Match by title for new modules
                    savedModule = updatedCourse.getModules().stream()
                            .filter(m -> m.getTitle().equals(mReq.getTitle()))
                            .findFirst()
                            .orElse(null);
                }

                if (savedModule != null && mReq.getQuiz() != null) {
                    List<Integer> originalQuestionIds = mReq.getQuiz().getQuestionIds();
                    List<Integer> realQuestionIds = new ArrayList<>();
                    if (originalQuestionIds != null) {
                        for (Integer origId : originalQuestionIds) {
                            Integer realId = questionIdMap.get(origId);
                            if (realId != null) {
                                realQuestionIds.add(realId);
                            } else {
                                realQuestionIds.add(origId);
                            }
                        }
                    }
                    mReq.getQuiz().setQuestionIds(realQuestionIds);
                    quizService.saveQuizForModule(savedModule, mReq.getQuiz());
                }
            }
        }

        // DỌN RÁC VIDEO (Lớp 4): Thu thập danh sách video MỚI sau khi cập nhật thành công
        List<String> newVideoUrls = new ArrayList<>();
        if (request.getPromoVideo() != null && !request.getPromoVideo().isEmpty()) {
            newVideoUrls.add(request.getPromoVideo());
        }
        if (request.getSections() != null) {
            for (ModuleRequest mReq : request.getSections()) {
                if (mReq.getLessons() != null) {
                    for (LessonRequest lReq : mReq.getLessons()) {
                        if (lReq.getVideoUrl() != null && !lReq.getVideoUrl().isEmpty()) {
                            newVideoUrls.add(lReq.getVideoUrl());
                        }
                    }
                }
            }
        }

        // Tìm ra những video cũ đã bị thay thế hoặc xóa
        List<String> deletedVideoUrls = oldVideoUrls.stream()
                .filter(url -> !newVideoUrls.contains(url))
                .collect(Collectors.toList());

        // Tiến hành xóa các video mồ côi trên Bunny CDN (nếu không còn bài học nào khác dùng chung)
        for (String url : deletedVideoUrls) {
            boolean isUsed = lessonRepository.existsByVideoUrl(url) || courseRepository.existsByPromoVideo(url);
            if (!isUsed) {
                String[] parts = url.split("/");
                if (parts.length >= 2) {
                    bunnyNetService.deleteVideo(parts[0], parts[1]);
                }
            }
        }

        // 4. Clear Redis Draft
        draftCourseService.deleteDraft(email, updatedCourse.getId().toString());

        return mapToCourseDetailResponse(updatedCourse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CourseResponse> getPublicCourses(Integer categoryId, java.util.List<String> categorySlugs,
            java.util.List<String> levels, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice,
            String search, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        int categoryIdFilter = categoryId == null ? -1 : categoryId;
        java.util.List<String> categorySlugFilters = categorySlugs == null ? java.util.List.of() : categorySlugs.stream()
                .filter(value -> value != null && !value.isBlank()).map(String::trim).toList();
        java.util.List<String> levelFilters = levels == null ? java.util.List.of() : levels.stream()
                .filter(value -> value != null && !value.isBlank() && !value.equalsIgnoreCase("all"))
                .map(String::trim).toList();
        String searchFilter = search == null ? "" : search.trim();
        java.math.BigDecimal minPriceFilter = minPrice == null ? java.math.BigDecimal.valueOf(-1) : minPrice.max(java.math.BigDecimal.ZERO);
        java.math.BigDecimal maxPriceFilter = maxPrice == null ? java.math.BigDecimal.valueOf(-1) : maxPrice.max(java.math.BigDecimal.ZERO);
        org.springframework.data.domain.Page<Course> coursesPage = courseRepository.findPublicCourses(
                categoryIdFilter,
                !categorySlugFilters.isEmpty(), categorySlugFilters.isEmpty() ? java.util.List.of("") : categorySlugFilters,
                !levelFilters.isEmpty(), levelFilters.isEmpty() ? java.util.List.of("") : levelFilters,
                minPriceFilter, maxPriceFilter,
                searchFilter, pageable);
        return coursesPage.map(this::mapToCourseResponse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CourseResponse> getInstructorCourses(String email, String search, Integer categoryId, Integer status, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        
        // Prep search string in Java to bypass complex concatenated SQL param resolution errors in Postgres
        String formattedSearch = null;
        if (search != null && !search.trim().isEmpty()) {
            formattedSearch = "%" + search.trim().toLowerCase() + "%";
        }
        
        org.springframework.data.domain.Page<Course> coursesPage = courseRepository.findInstructorCourses(email, formattedSearch, categoryId, status, pageable);
        return coursesPage.map(this::mapToCourseResponse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CourseResponse> getAllActiveCourses(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        return courseRepository.findByStatusAndDeletedAtIsNull(1, pageable).map(this::mapToCourseResponse);
    }

    @Transactional
    public CourseDetailResponse patchCourseStatus(java.util.UUID id, Integer status, String email) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (!course.getAccount().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa khóa học này");
        }

        if (status == 1 && course.getCategory() != null && (course.getCategory().getStatus() == null || course.getCategory().getStatus() == 0)) {
            throw new RuntimeException("Danh mục của khóa học đang ẩn, không thể chuyển trạng thái sang Hoạt động.");
        }

        course.setStatus(status);

        // Propagate status to modules and lessons
        if (course.getModules() != null) {
            for (Module m : course.getModules()) {
                m.setStatus(status);
                if (m.getLessons() != null) {
                    for (Lesson l : m.getLessons()) {
                        l.setStatus(status);
                    }
                }
            }
        }

        return mapToCourseDetailResponse(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CourseResponse> getModerationCourses(
            Integer status, String search, Integer categoryId, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("updatedAt").descending());
        String normalizedSearch = search == null ? "" : search.trim();
        int normalizedStatus = status == null ? -1 : status;
        int normalizedCategoryId = categoryId == null ? -1 : categoryId;
        return courseRepository.findModerationCourses(
                        normalizedStatus, normalizedSearch, normalizedCategoryId, pageable)
                .map(this::mapToCourseResponse);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getModerationStats() {
        java.util.List<Object[]> results = courseRepository.countModerationStats();
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("pending", 0L);
        stats.put("approved", 0L);
        stats.put("rejected", 0L);
        stats.put("total", 0L);
        
        if (results != null) {
            for (Object[] row : results) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    Integer status = (Integer) row[0];
                    Long count = (Long) row[1];
                    stats.put("total", stats.get("total") + count);
                    if (status == 4) stats.put("pending", count);
                    else if (status == 1) stats.put("approved", count);
                    else if (status == 3) stats.put("rejected", count);
                }
            }
        }
        return stats;
    }

    @Transactional(readOnly = true)
    public CourseDetailResponse getCourseForModerationBySlug(String slug) {
        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học để kiểm duyệt"));
        return mapToCourseDetailResponse(course);
    }

    @Transactional(readOnly = true)
    public Course getCourseEntityForModerationBySlug(String slug) {
        return courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học để kiểm duyệt"));
    }

    @Transactional
    public CourseDetailResponse approveCourseBySlug(String slug) {
        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học để phê duyệt"));
        
        Course targetCourse = course;

        if (course.getOriginalCourse() != null) {
            // Versioning: Cập nhật đè (merge) lên khóa học gốc
            Course original = course.getOriginalCourse();
            
            original.setTitle(course.getTitle());
            original.setDescription(course.getDescription());
            original.setThumbnail(course.getThumbnail());
            original.setPrice(course.getPrice());
            original.setDiscount(course.getDiscount());
            original.setLevel(course.getLevel());
            original.setMetadata(course.getMetadata());
            original.setCategory(course.getCategory());
            original.setPromoVideo(course.getPromoVideo());
            original.setVersionNumber(course.getVersionNumber());
            original.setStatus(1); // Published
            
            // Xử lý Modules
            List<Module> originalModules = original.getModules();
            if (originalModules == null) {
                originalModules = new ArrayList<>();
                original.setModules(originalModules);
            }
            // Đánh dấu xóa tạm thời tất cả module gốc, module nào còn sẽ được khôi phục
            originalModules.forEach(m -> m.setDeleted(true));
            
            if (course.getModules() != null) {
                for (Module newMod : course.getModules()) {
                    if (Boolean.TRUE.equals(newMod.getDeleted())) continue;
                    
                    Module targetMod = null;
                    if (newMod.getOriginalModule() != null) {
                        targetMod = originalModules.stream()
                            .filter(m -> m.getId().equals(newMod.getOriginalModule().getId()))
                            .findFirst()
                            .orElse(null);
                    }
                    if (targetMod == null) {
                        targetMod = new Module();
                        targetMod.setCourse(original);
                        originalModules.add(targetMod);
                    }
                    
                    targetMod.setDeleted(false);
                    targetMod.setTitle(newMod.getTitle());
                    targetMod.setMetadata(newMod.getMetadata());
                    targetMod.setStatus(1);
                    targetMod.setVersionNumber(newMod.getVersionNumber());
                    targetMod.setSortOrder(newMod.getSortOrder());
                    
                    // Xử lý bài học
                    List<Lesson> originalLessons = targetMod.getLessons();
                    if (originalLessons == null) {
                        originalLessons = new ArrayList<>();
                        targetMod.setLessons(originalLessons);
                    }
                    originalLessons.forEach(l -> l.setDeleted(true));
                    
                    if (newMod.getLessons() != null) {
                        for (Lesson newLes : newMod.getLessons()) {
                            if (Boolean.TRUE.equals(newLes.getDeleted())) continue;
                            
                            Lesson targetLes = null;
                            if (newLes.getOriginalLesson() != null) {
                                targetLes = originalLessons.stream()
                                    .filter(l -> l.getId().equals(newLes.getOriginalLesson().getId()))
                                    .findFirst()
                                    .orElse(null);
                            }
                            if (targetLes == null) {
                                targetLes = new Lesson();
                                targetLes.setModule(targetMod);
                                originalLessons.add(targetLes);
                            }
                            
                            targetLes.setDeleted(false);
                            targetLes.setTitle(newLes.getTitle());
                            targetLes.setContent(newLes.getContent());
                            targetLes.setVideoUrl(newLes.getVideoUrl());
                            targetLes.setMetadata(newLes.getMetadata());
                            targetLes.setStatus(1);
                        }
                    }
                }
            }
            
            // Versioning: Gộp ngân hàng câu hỏi từ V2 sang V1
            List<com.gnostica.modules.course.dto.response.QuestionDto> v2Questions = questionBankService.getQuestionsByCourseId(course.getId());
            java.util.Map<Integer, Integer> questionIdMap = new java.util.HashMap<>();
            if (v2Questions != null && !v2Questions.isEmpty()) {
                questionIdMap = questionBankService.saveQuestionBankAndGetMap(original, v2Questions);
            }
            
            // Cập nhật lại câu hỏi cho Quiz (nếu có Quiz)
            for (Module newMod : course.getModules()) {
                if (!Boolean.TRUE.equals(newMod.getDeleted()) && newMod.getOriginalModule() != null) {
                    Module targetMod = originalModules.stream()
                        .filter(m -> m.getId().equals(newMod.getOriginalModule().getId()))
                        .findFirst()
                        .orElse(null);
                        
                    if (targetMod != null) {
                        quizService.mergeQuizFromV2ToV1(targetMod, newMod, questionIdMap);
                    }
                }
            }
            
            // Xóa khóa học clone (V2) sau khi đã gộp xong
            course.setDeleted(true);
            courseRepository.save(course);
            
            targetCourse = original;
        } else {
            // Duyệt khóa học bình thường (không có bản clone)
            course.setStatus(1); // Chuyển thành Hoạt động
            
            if (course.getModules() != null) {
                for (Module m : course.getModules()) {
                    if (!Boolean.TRUE.equals(m.getDeleted())) {
                        m.setStatus(1);
                        if (m.getLessons() != null) {
                            for (Lesson l : m.getLessons()) {
                                if (!Boolean.TRUE.equals(l.getDeleted())) {
                                    l.setStatus(1);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        notificationService.createNotification(targetCourse.getAccount(), "Khóa học được phê duyệt",
                "Khóa học '" + targetCourse.getTitle() + "' của bạn đã được Admin phê duyệt và xuất bản.", "SYSTEM");
        
        return mapToCourseDetailResponse(courseRepository.save(targetCourse));
    }

    @Transactional
    public CourseDetailResponse rejectCourseBySlug(String slug, String rejectReason) {
        Course course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
        
        course.setStatus(3); // Bị từ chối
        course.setRejectReason(rejectReason != null && !rejectReason.trim().isEmpty() ? rejectReason.trim() : "Nội dung khóa học chưa đáp ứng chuẩn kiểm duyệt.");
        notificationService.createNotification(course.getAccount(), "Khóa học bị từ chối",
                "Khóa học '" + course.getTitle() + "' của bạn bị từ chối phê duyệt. Lý do: " + (rejectReason != null ? rejectReason : ""), "SYSTEM");
        
        return mapToCourseDetailResponse(courseRepository.save(course));
    }

    private String generateUniqueSlug(String baseSlug, java.util.UUID id) {
        String slug = baseSlug;
        int count = 1;

        while (id == null ? courseRepository.existsBySlugAndDeletedAtIsNull(slug) : courseRepository.existsBySlugAndIdNotAndDeletedAtIsNull(slug, id)) {
            slug = baseSlug + "-" + count;
            count++;
        }

        return slug;
    }


    @Transactional(readOnly = true)
    public List<String> getPublicLevels() {
        return courseRepository.findDistinctPublicLevels();
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Course> getRecommendedCourses(String email, int page, int size) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        java.util.List<Integer> categoryIds = null;

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());

        return courseRepository.findRecommendedCourses("Beginner", categoryIds, pageable);
    }

    public CourseResponse mapToCourseResponse(Course course) {
        if (course == null) return null;
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setSlug(course.getSlug());
        response.setDescription(course.getDescription());
        response.setThumbnail(course.getThumbnail());
        response.setPrice(course.getPrice());
        response.setDiscount(course.getDiscount());
        response.setSalePrice(course.getSalePrice());
        response.setLevel(course.getLevel());
        response.setMetadata(course.getMetadata());
        response.setStatus(course.getStatus());
        response.setDeleted(course.getDeleted());
        response.setRejectReason(course.getRejectReason() != null ? course.getRejectReason() : "");
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        response.setIsEnrolled(false);

        if (course.getCategory() != null) {
            response.setCategoryId(course.getCategory().getId());
            response.setCategoryName(course.getCategory().getName());
        }

        if (course.getAccount() != null) {
            response.setInstructorId(course.getAccount().getId());
            response.setInstructorName(course.getAccount().getFullName());
            response.setInstructorAvatar(course.getAccount().getAvatar());
            response.setInstructorEmail(course.getAccount().getEmail());
            response.setInstructorPhone(course.getAccount().getPhone());
            response.setInstructorCreatedAt(course.getAccount().getCreatedAt());
        }

        response.setClasses(course.getModules() != null ? course.getModules().size() : 0);
        response.setStudents(course.getEnrollments() != null ? course.getEnrollments().size() : 0);
        return response;
    }

    public CourseDetailResponse mapToCourseDetailResponse(Course course) {
        if (course == null) return null;
        CourseDetailResponse response = new CourseDetailResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setSlug(course.getSlug());
        response.setDescription(course.getDescription());
        response.setThumbnail(course.getThumbnail());
        response.setPromoVideo(course.getPromoVideo());
        response.setPrice(course.getPrice());
        response.setDiscount(course.getDiscount());
        response.setSalePrice(course.getSalePrice());
        response.setLevel(course.getLevel());
        response.setMetadata(course.getMetadata());
        response.setStatus(course.getStatus());
        response.setDeleted(course.getDeleted());
        response.setRejectReason(course.getRejectReason() != null ? course.getRejectReason() : "");
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        response.setIsEnrolled(false);

        if (course.getCategory() != null) {
            response.setCategoryId(course.getCategory().getId());
            response.setCategoryName(course.getCategory().getName());
        }

        if (course.getAccount() != null) {
            response.setInstructorId(course.getAccount().getId());
            response.setInstructorName(course.getAccount().getFullName());
            response.setInstructorAvatar(course.getAccount().getAvatar());
            response.setInstructorEmail(course.getAccount().getEmail());
            response.setInstructorPhone(course.getAccount().getPhone());
            response.setInstructorCreatedAt(course.getAccount().getCreatedAt());
        }

        response.setClasses(course.getModules() != null ? course.getModules().size() : 0);
        response.setStudents(course.getEnrollments() != null ? course.getEnrollments().size() : 0);
        
        if (course.getModules() != null) {
            response.setModules(course.getModules().stream()
                    .map(this::mapToModuleResponse)
                    .collect(java.util.stream.Collectors.toList()));
        }
        
        return response;
    }

    private com.gnostica.modules.course.dto.response.ModuleResponse mapToModuleResponse(com.gnostica.core.model.Module module) {
        if (module == null) return null;
        com.gnostica.modules.course.dto.response.ModuleResponse response = new com.gnostica.modules.course.dto.response.ModuleResponse();
        response.setId(module.getId());
        response.setTitle(module.getTitle());
        response.setMetadata(module.getMetadata());
        response.setCreatedAt(module.getCreatedAt());
        response.setUpdatedAt(module.getUpdatedAt());
        response.setStatus(module.getStatus());
        response.setDeleted(module.getDeleted());

        if (module.getLessons() != null) {
            response.setLessons(module.getLessons().stream()
                    .map(this::mapToLessonResponse)
                    .collect(java.util.stream.Collectors.toList()));
        }

        if (module.getAttachments() != null) {
            response.setAttachments(module.getAttachments().stream()
                    .map(this::mapToAttachmentResponse)
                    .collect(java.util.stream.Collectors.toList()));
        }
        
        response.setQuiz(quizService.getQuizResponseByModuleId(module.getId()));

        return response;
    }

    private com.gnostica.modules.course.dto.response.LessonResponse mapToLessonResponse(com.gnostica.core.model.Lesson lesson) {
        if (lesson == null) return null;
        com.gnostica.modules.course.dto.response.LessonResponse response = new com.gnostica.modules.course.dto.response.LessonResponse();
        response.setId(lesson.getId());
        response.setTitle(lesson.getTitle());
        response.setContent(lesson.getContent());
        response.setVideoUrl(lesson.getVideoUrl());
        response.setMetadata(lesson.getMetadata());
        response.setStatus(lesson.getStatus());
        response.setDeleted(lesson.getDeleted());
        response.setCreatedAt(lesson.getCreatedAt());
        response.setUpdatedAt(lesson.getUpdatedAt());
        return response;
    }

    private com.gnostica.modules.course.dto.response.AttachmentResponse mapToAttachmentResponse(com.gnostica.core.model.Attachment attachment) {
        if (attachment == null) return null;
        com.gnostica.modules.course.dto.response.AttachmentResponse response = new com.gnostica.modules.course.dto.response.AttachmentResponse();
        response.setId(attachment.getId());
        response.setFileType(attachment.getFileType());
        response.setFileUrl(attachment.getFileUrl());
        return response;
    }
}
