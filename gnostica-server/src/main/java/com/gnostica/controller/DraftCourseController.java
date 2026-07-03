package com.gnostica.controller;

import com.gnostica.dto.request.CourseRequest;
import com.gnostica.core.model.Course;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.service.DraftCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/courses/draft")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DraftCourseController {

    private final DraftCourseService draftCourseService;
    private final CourseRepository courseRepository;

    @PostMapping
    public ResponseEntity<?> saveDraft(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String slug,
            @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        String idToUse = courseId;
        
        // Nếu không có courseId nhưng có slug, tra cứu id từ slug
        if ((idToUse == null || idToUse.isEmpty()) && (slug != null && !slug.isEmpty() && !slug.equals("new"))) {
            Optional<Course> course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug);
            if (course.isPresent()) {
                idToUse = course.get().getId().toString();
            }
        }
        
        draftCourseService.saveDraft(email, idToUse, request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã lưu nháp tự động. Bản nháp này có hiệu lực 24h");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getDraft(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String slug,
            Authentication authentication
    ) {
        String email = authentication.getName();
        String idToUse = courseId;

        // Ưu tiên resolve slug sang id nếu id trống
        if ((idToUse == null || idToUse.isEmpty()) && (slug != null && !slug.isEmpty() && !slug.equals("new"))) {
            Optional<Course> course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug);
            if (course.isPresent()) {
                idToUse = course.get().getId().toString();
            }
        }

        CourseRequest draft = draftCourseService.getDraft(email, idToUse);
        if (draft == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(draft);
    }
    @GetMapping("/all")
    public ResponseEntity<?> getAllDrafts(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(draftCourseService.getAllDrafts(email));
    }
    
    @DeleteMapping
    public ResponseEntity<?> deleteDraft(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String slug,
            Authentication authentication
    ) {
        String email = authentication.getName();
        String idToUse = courseId;

        if ((idToUse == null || idToUse.isEmpty()) && (slug != null && !slug.isEmpty() && !slug.equals("new"))) {
            Optional<Course> course = courseRepository.findFirstBySlugAndDeletedFalseOrderByIdDesc(slug);
            if (course.isPresent()) {
                idToUse = course.get().getId().toString();
            }
        }

        draftCourseService.deleteDraft(email, idToUse);
        return ResponseEntity.ok().build();
    }
}
