package com.gnostica.service;

import com.gnostica.dto.request.CourseRequest;
import com.gnostica.dto.request.LessonRequest;
import com.gnostica.dto.request.ModuleRequest;
import com.gnostica.dto.response.*;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Attachment;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Lesson;
import com.gnostica.core.model.Module;
import com.gnostica.core.model.Quiz;
import com.gnostica.core.model.Question;
import com.gnostica.core.model.Answer;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CategoryRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.LessonRepository;
import com.gnostica.service.NotificationService;
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
    private final AiModerationService aiModerationService;
    private final LessonRepository lessonRepository;
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
        course.setPrice(request.getPrice() != null ? request.getPrice() : 0.0);
        course.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0);

        course.setLevel(request.getLevel() != null ? request.getLevel() : "Beginner");
        course.setPromoVideo(request.getPromoVideo());

        course.setCategory(category);
        course.setAccount(account);

        // Kiểm tra danh mục trước khi cho phép gửi duyệt
        if (!category.getStatus()) {
            throw new RuntimeException("Danh mục cha đang bị ẩn, không thể tạo khóa học.");
        }

        // Default Status: 4 (Chờ duyệt)
        course.setStatus(4);

        // 3. Map Modules (Sections)
        List<Module> modules = new ArrayList<>();
        if (request.getSections() != null && !request.getSections().isEmpty()) {
            for (ModuleRequest mReq : request.getSections()) {
                Module module = new Module();
                module.setTitle(mReq.getTitle());
                module.setStatus(mReq.getStatus() != null ? mReq.getStatus() : course.getStatus());
                module.setCourse(course);

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
                    for (LessonRequest lReq : mReq.getLessons()) {
                        Lesson lesson = new Lesson();
                        lesson.setTitle(lReq.getTitle());
                        lesson.setContent(lReq.getContent());
                        lesson.setVideoUrl(lReq.getVideoUrl());
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

        // --- BỨC TƯỜNG LỬA AI (AI FIREWALL) ---
        // User Request: Tắt tự động quét lúc Lưu để tăng tốc độ lưu khóa học.
        // Việc quét AI chỉ thực hiện thủ công khi giảng viên bấm "Quét thử" trên giao diện.
        // executeAiFirewall(savedCourse);

        return savedCourse;
    }

    @Transactional(readOnly = true)
    public CourseDetailResponse getCourseBySlug(String slug, String email) {
        Course course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug)
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
        course.setIsEnrolled(isEnrolled);

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

        return mapToCourseDetailResponse(course);
    }

    @Transactional
    public void deleteCourse(Integer id, String email) {
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
        Course course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (!course.getAccount().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa khóa học này");
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

        // Reset AI report if key textual metadata is edited
        if (course.getTitle() == null || !course.getTitle().equals(request.getTitle()) || 
            course.getDescription() == null || !course.getDescription().equals(request.getDescription())) {
            course.setAiModerationReport(null);
        }

        // Update basic info
        course.setTitle(request.getTitle());
        course.setSlug(generateUniqueSlug(request.getSlug(), course.getId()));
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        course.setPrice(request.getPrice());
        course.setDiscount(request.getDiscount());

        course.setLevel(request.getLevel());
        course.setCategory(category);

        if (!category.getStatus()) {
            throw new RuntimeException("Danh mục cha đang bị ẩn, không thể cập nhật khóa học.");
        }

        // Khóa học chuyển về trạng thái Chờ duyệt sau khi sửa
        course.setStatus(4);
        course.setRejectReason(null);
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
                        isNewModule = true;
                    }
                } else {
                    // Create new
                    module = new Module();
                    module.setCourse(course);
                    isNewModule = true;
                }

                module.setTitle(mReq.getTitle());
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

                    for (LessonRequest lReq : requestedLessons) {
                        Lesson lesson;
                        if (lReq.getId() != null) {
                            lesson = currentLessons.stream()
                                    .filter(l -> l.getId().equals(lReq.getId()))
                                    .findFirst()
                                    .orElseGet(() -> {
                                        Lesson newLess = new Lesson();
                                        newLess.setModule(module);
                                        currentLessons.add(newLess);
                                        return newLess;
                                    });
                        } else {
                            lesson = new Lesson();
                            lesson.setModule(module);
                            currentLessons.add(lesson);
                        }
                        lesson.setTitle(lReq.getTitle());
                        lesson.setContent(lReq.getContent());
                        
                        String oldVideoUrl = lesson.getVideoUrl();
                        String newVideoUrl = lReq.getVideoUrl();
                        if (oldVideoUrl == null || !oldVideoUrl.equals(newVideoUrl)) {
                            lesson.setAiModerationReport(null); // Clear report to trigger automatic re-scan
                        }
                        lesson.setVideoUrl(newVideoUrl);

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

        // --- BỨC TƯỜNG LỬA AI (AI FIREWALL) ---
        // User Request: Tắt tự động quét lúc Lưu để tăng tốc độ lưu khóa học.
        // Việc quét AI chỉ thực hiện thủ công khi giảng viên bấm "Quét thử" trên giao diện.
        // executeAiFirewall(updatedCourse);

        return mapToCourseDetailResponse(updatedCourse);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CourseResponse> getPublicCourses(Integer categoryId, String categorySlug,
            String level, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        // Chuyển level sang lowercase hoặc xử lý null
        String levelFilter = (level != null && !level.trim().isEmpty() && !level.equalsIgnoreCase("all")) ? level
                : null;
        org.springframework.data.domain.Page<Course> coursesPage = courseRepository.findPublicCourses(categoryId, categorySlug, levelFilter, pageable);
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
        return courseRepository.findByStatusAndDeletedFalse(1, pageable).map(this::mapToCourseResponse);
    }

    @Transactional
    public CourseDetailResponse patchCourseStatus(Integer id, Integer status, String email) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (!course.getAccount().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa khóa học này");
        }

        // Rule 3: Kiểm tra trạng thái danh mục trước khi cho phép Hiện khóa học
        if (status == 1 && course.getCategory() != null && !course.getCategory().getStatus()) {
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
    public org.springframework.data.domain.Page<CourseResponse> getModerationCourses(Integer status, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("updatedAt").descending());
        return courseRepository.findModerationCourses(status, pageable).map(this::mapToCourseResponse);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getModerationStats() {
        java.util.List<Object[]> results = courseRepository.countModerationStats();
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("pending", 0L);
        stats.put("approved", 0L);
        stats.put("rejected", 0L);
        
        if (results != null) {
            for (Object[] row : results) {
                if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                    Integer status = (Integer) row[0];
                    Long count = (Long) row[1];
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
        Course course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học để kiểm duyệt"));
        return mapToCourseDetailResponse(course);
    }

    @Transactional(readOnly = true)
    public Course getCourseEntityForModerationBySlug(String slug) {
        return courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học để kiểm duyệt"));
    }

    @Transactional
    public CourseDetailResponse approveCourseBySlug(String slug) {
        Course course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học để phê duyệt"));
        
        course.setStatus(1); // Chuyển thành Hoạt động
        course.setRejectReason(null);

        // Phê duyệt cho cả các chương, bài học chưa bị xóa
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
        
        notificationService.createNotification(course.getAccount(), "Khóa học được phê duyệt",
                "Khóa học '" + course.getTitle() + "' của bạn đã được Admin phê duyệt và xuất bản.", "SYSTEM");
        
        return mapToCourseDetailResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseDetailResponse rejectCourseBySlug(String slug, String rejectReason) {
        Course course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
        
        course.setStatus(3); // Bị từ chối
        course.setRejectReason(rejectReason != null && !rejectReason.trim().isEmpty() ? rejectReason.trim() : "Nội dung khóa học chưa đáp ứng chuẩn kiểm duyệt.");
        
        notificationService.createNotification(course.getAccount(), "Khóa học bị từ chối",
                "Khóa học '" + course.getTitle() + "' của bạn bị từ chối phê duyệt. Lý do: " + course.getRejectReason(), "SYSTEM");
        
        return mapToCourseDetailResponse(courseRepository.save(course));
    }

    private String generateUniqueSlug(String baseSlug, Integer id) {
        String slug = baseSlug;
        int count = 1;

        while (id == null ? courseRepository.existsBySlugAndDeletedFalse(slug) : courseRepository.existsBySlugAndIdNotAndDeletedFalse(slug, id)) {
            slug = baseSlug + "-" + count;
            count++;
        }

        return slug;
    }

    /**
     * Executes automated AI Moderation checks on active, unscanned lessons.
     * Blocks further processing if explicit policy breaches are encountered.
     */
    private void executeAiFirewall(Course course) {
        // Phase 1: Scan Overall Course Metadata (Title/Description)
        if (course.getAiModerationReport() == null) {
            aiModerationService.scanCourseInfo(course);
        }

        String courseReport = course.getAiModerationReport();
        if (courseReport != null && (courseReport.contains("\"severity\":\"CRITICAL\"") || courseReport.contains("\"severity\":\"HIGH\""))) {
            throw new RuntimeException("🔥 BỨC TƯỜNG LỬA AI: Phát hiện vi phạm chính sách nghiêm trọng trong phần Tiêu đề hoặc Mô tả khóa học. Vui lòng kiểm tra lại nội dung văn bản!");
        }

        // Phase 2: Scan individual lessons as before
        if (course.getModules() != null) {
            for (Module m : course.getModules()) {
                if (Boolean.TRUE.equals(m.getDeleted())) continue;
                if (m.getLessons() != null) {
                    for (Lesson l : m.getLessons()) {
                        if (Boolean.TRUE.equals(l.getDeleted())) continue;

                        // Scan lesson automatically if it lacks an AI report
                        if (l.getAiModerationReport() == null) {
                            aiModerationService.scanLesson(l);
                        }

                        // Interrogate result payload for CRITICAL or HIGH severity violations
                        String report = l.getAiModerationReport();
                        if (report != null && (report.contains("\"severity\":\"CRITICAL\"") || report.contains("\"severity\":\"HIGH\""))) {
                            throw new RuntimeException("🔥 BỨC TƯỜNG LỬA AI: Phát hiện vi phạm chính sách nghiêm trọng tại bài học '" 
                                + l.getTitle() + "'. Vui lòng kiểm tra chi tiết lỗi và cập nhật lại video!");
                        }
                    }
                }
            }
        }
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
        if (account.getInterests() != null && !account.getInterests().isEmpty()) {
            categoryIds = account.getInterests().stream().map(Category::getId).collect(Collectors.toList());
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());

        return courseRepository.findRecommendedCourses(account.getLevel(), categoryIds, pageable);
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
        response.setStatus(course.getStatus());
        response.setDeleted(course.getDeleted());
        response.setRejectReason(course.getRejectReason());
        response.setAiModerationReport(course.getAiModerationReport());
        response.setAiModerationStatus(course.getAiModerationStatus());
        response.setAiModerationLastContentHash(course.getAiModerationLastContentHash());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        response.setIsEnrolled(course.getIsEnrolled());

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
        response.setPrice(course.getPrice());
        response.setDiscount(course.getDiscount());
        response.setSalePrice(course.getSalePrice());
        response.setLevel(course.getLevel());
        response.setStatus(course.getStatus());
        response.setDeleted(course.getDeleted());
        response.setRejectReason(course.getRejectReason());
        response.setAiModerationReport(course.getAiModerationReport());
        response.setAiModerationStatus(course.getAiModerationStatus());
        response.setAiModerationLastContentHash(course.getAiModerationLastContentHash());
        response.setCreatedAt(course.getCreatedAt());
        response.setUpdatedAt(course.getUpdatedAt());
        response.setIsEnrolled(course.getIsEnrolled());

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
}
