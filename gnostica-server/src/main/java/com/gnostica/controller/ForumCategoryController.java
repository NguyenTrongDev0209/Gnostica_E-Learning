package com.gnostica.controller;

import com.gnostica.model.ForumCategory;
import com.gnostica.repository.ForumCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum-categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ForumCategoryController {

    @Autowired
    private ForumCategoryRepository forumCategoryRepository;

    @GetMapping
    public ResponseEntity<List<ForumCategory>> getAllCategories() {
        return ResponseEntity.ok(forumCategoryRepository.findAll());
    }
}
