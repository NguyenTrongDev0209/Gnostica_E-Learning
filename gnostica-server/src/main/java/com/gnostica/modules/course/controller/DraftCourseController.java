package com.gnostica.modules.course.controller;

import com.gnostica.modules.course.dto.request.CourseRequest;
import com.gnostica.core.model.Course;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.modules.course.service.DraftCourseService;
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
        
        // Náº¿u khÃ´ng cÃ³ courseId nhÆ°ng cÃ³ slug, tra cá»©u id tá»« slug
        if ((idToUse == null || idToUse.isEmpty()) && (slug != null && !slug.isEmpty() && !slug.equals("new"))) {
            Optional<Course> course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug);
            if (course.isPresent()) {
                idToUse = course.get().getId().toString();
            }
        }
        
        draftCourseService.saveDraft(email, idToUse, request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "ÄÃ£ lÆ°u nhÃ¡p tá»± Ä‘á»™ng. Báº£n nhÃ¡p nÃ y cÃ³ hiá»‡u lá»±c 24h");
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

        // Æ¯u tiÃªn resolve slug sang id náº¿u id trá»‘ng
        if ((idToUse == null || idToUse.isEmpty()) && (slug != null && !slug.isEmpty() && !slug.equals("new"))) {
            Optional<Course> course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug);
            if (course.isPresent()) {
                idToUse = course.get().getId().toString();
            }
        }

        CourseRequest draft = draftCourseService.getDraft(email, idToUse);
        if (draft == null) {
            return ResponseEntity.ok().build();
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
            Optional<Course> course = courseRepository.findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(slug);
            if (course.isPresent()) {
                idToUse = course.get().getId().toString();
            }
        }

        draftCourseService.deleteDraft(email, idToUse);
        return ResponseEntity.ok().build();
    }
}
