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

        // Rule 3: Kiểm tra trạng thái danh mục trước khi cho phép Hiện khóa học
        if (request.getStatus() != null && request.getStatus() == 1 && !category.getStatus()) {
            throw new RuntimeException("Danh mục đang ẩn, không thể tạo khóa học ở trạng thái Hoạt động.");
        }

        // Default Status: 1 (Hoạt động)
        course.setStatus(request.getStatus() != null ? request.getStatus() : 1);

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

        // 5. Clear Redis Draft
        draftCourseService.deleteDraft(email, null); // "new" draft

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

        // Update basic info
        course.setTitle(request.getTitle());
        course.setSlug(request.getSlug());
        course.setDescription(request.getDescription());
        course.setThumbnail(request.getThumbnail());
        course.setPrice(request.getPrice());
        course.setDiscount(request.getDiscount());

        course.setLevel(request.getLevel());
        course.setCategory(category);

        // Rule 3: Kiểm tra trạng thái danh mục trước khi cho phép Hiện khóa học
        if (request.getStatus() != null && request.getStatus() == 1 && !category.getStatus()) {
            throw new RuntimeException("Danh mục đang ẩn, không thể chuyển khóa học sang trạng thái Hoạt động.");
        }

        course.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        course.setPromoVideo(request.getPromoVideo());

        // 3. Smart Update Modules
        List<Module> currentModules = course.getModules();
        List<ModuleRequest> requestedSections = request.getSections();

        // Remove modules not in request
        if (requestedSections == null) {
            currentModules.clear();
        } else {
            currentModules.removeIf(existingModule -> requestedSections.stream()
                    .noneMatch(req -> req.getId() != null && req.getId().equals(existingModule.getId())));

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
                if (requestedLessons == null) {
                    currentLessons.clear();
                } else {
                    // Remove lessons not in request
                    currentLessons.removeIf(existingLesson -> requestedLessons.stream()
                            .noneMatch(req -> req.getId() != null && req.getId().equals(existingLesson.getId())));

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
                        lesson.setVideoUrl(lReq.getVideoUrl());

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
        for (Module m : course.getModules()) {
            if (m.getLessons() == null || m.getLessons().isEmpty()) {
                throw new RuntimeException("Lỗi dữ liệu: Chương '" + m.getTitle()
                        + "' không có bài học nào! Hệ thống bắt buộc mỗi chương phải có bài học. Vui lòng kiểm tra lại các chương cũ hoặc thêm bài học cho chương mới.");
            }
        }

        Course updatedCourse = courseRepository.save(course);

        // 4. Clear Redis Draft
        draftCourseService.deleteDraft(email, updatedCourse.getId().toString());

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
    public org.springframework.data.domain.Page<Course> getInstructorCourses(String email, int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("id").descending());
        return courseRepository.findByAccountEmailAndDeletedFalse(email, pageable);
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

    private String generateUniqueSlug(String baseSlug, Integer id) {
        String slug = baseSlug;
        int count = 1;

        while (id == null ? courseRepository.existsBySlug(slug) : courseRepository.existsBySlugAndIdNot(slug, id)) {
            slug = baseSlug + "-" + count;
            count++;
        }

        return slug;
    }
}
