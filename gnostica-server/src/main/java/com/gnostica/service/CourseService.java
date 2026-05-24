package com.gnostica.service;

import com.gnostica.dto.request.CourseRequest;
import com.gnostica.dto.request.LessonRequest;
import com.gnostica.dto.request.ModuleRequest;
import com.gnostica.model.Account;
import com.gnostica.model.Attachment;
import com.gnostica.model.Category;
import com.gnostica.model.Course;
import com.gnostica.model.Lesson;
import com.gnostica.model.Module;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CategoryRepository;
import com.gnostica.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
        course.setSlug(request.getSlug());
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
    public Course getCourseBySlug(String slug, String email) {
        Course course = courseRepository.findBySlug(slug)
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

        return course;
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
    public Course updateCourseBySlug(String slug, CourseRequest request, String email) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        if (!course.getAccount().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa khóa học này");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        // Reset AI report if key textual metadata is edited
        if (course.getTitle() == null || !course.getTitle().equals(request.getTitle()) || 
            course.getDescription() == null || !course.getDescription().equals(request.getDescription())) {
            course.setAiModerationReport(null);
        }

        // Update basic info
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
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

        // 4. Clear Redis Draft
        draftCourseService.deleteDraft(email, updatedCourse.getId().toString());

        // --- BỨC TƯỜNG LỬA AI (AI FIREWALL) ---
        // User Request: Tắt tự động quét lúc Lưu để tăng tốc độ lưu khóa học.
        // Việc quét AI chỉ thực hiện thủ công khi giảng viên bấm "Quét thử" trên giao diện.
        // executeAiFirewall(updatedCourse);

        return updatedCourse;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Course> getPublicCourses(Integer categoryId, String categorySlug,
            String level, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        // Chuyển level sang lowercase hoặc xử lý null
        String levelFilter = (level != null && !level.trim().isEmpty() && !level.equalsIgnoreCase("all")) ? level
                : null;
        return courseRepository.findPublicCourses(categoryId, categorySlug, levelFilter, pageable);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Course> getInstructorCourses(String email, String search, Integer categoryId, Integer status, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        
        // Prep search string in Java to bypass complex concatenated SQL param resolution errors in Postgres
        String formattedSearch = null;
        if (search != null && !search.trim().isEmpty()) {
            formattedSearch = "%" + search.trim().toLowerCase() + "%";
        }
        
        return courseRepository.findInstructorCourses(email, formattedSearch, categoryId, status, pageable);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Course> getAllActiveCourses(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        return courseRepository.findByStatusAndDeletedFalse(1, pageable);
    }

    @Transactional
    public Course patchCourseStatus(Integer id, Integer status, String email) {
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

        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Course> getModerationCourses(Integer status, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("updatedAt").descending());
        return courseRepository.findModerationCourses(status, pageable);
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
    public Course getCourseForModerationBySlug(String slug) {
        return courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học để kiểm duyệt"));
    }

    @Transactional
    public Course approveCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
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
        return courseRepository.save(course);
    }

    @Transactional
    public Course rejectCourseBySlug(String slug, String rejectReason) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));
        
        course.setStatus(3); // Bị từ chối
        course.setRejectReason(rejectReason != null && !rejectReason.trim().isEmpty() ? rejectReason.trim() : "Nội dung khóa học chưa đáp ứng chuẩn kiểm duyệt.");
        
        return courseRepository.save(course);
    }

    private String generateUniqueSlug(String baseSlug, Integer id) {
        String slug = baseSlug;
        int count = 1;

        while (id == null ? courseRepository.existsBySlug(slug) : courseRepository.existsBySlugAndIdNot(slug, id)) {
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
}
