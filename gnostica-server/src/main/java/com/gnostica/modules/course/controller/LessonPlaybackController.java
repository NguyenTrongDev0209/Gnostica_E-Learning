package com.gnostica.modules.course.controller;

import com.gnostica.modules.course.service.LessonPlaybackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonPlaybackController {
    private final LessonPlaybackService lessonPlaybackService;

    @GetMapping("/{lessonId}/playback")
    public ResponseEntity<Map<String, String>> getPlaybackUrl(@PathVariable Integer lessonId, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(lessonPlaybackService.resolve(lessonId, email));
    }

}
