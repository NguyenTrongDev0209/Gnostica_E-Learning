package com.gnostica.modules.course.controller;

import com.gnostica.core.model.ForumCategory;
import com.gnostica.core.repository.ForumCategoryRepository;
import com.gnostica.core.repository.ThreadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/forum-categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ForumCategoryController {

    @Autowired
    private ForumCategoryRepository forumCategoryRepository;

    @Autowired
    private ThreadRepository threadRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCategories() {
        List<ForumCategory> categories = forumCategoryRepository.findAll();
        List<Object[]> counts = threadRepository.findThreadCountsByCategory();
        
        // Map categoryId to count
        Map<Integer, Long> countMap = counts.stream()
            .collect(Collectors.toMap(
                row -> (Integer) row[0],
                row -> (Long) row[1]
            ));

        List<Map<String, Object>> response = categories.stream().map(cat -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", cat.getId());
            map.put("name", cat.getName());
            map.put("slug", cat.getSlug());
            map.put("status", cat.getStatus());
            map.put("threadCount", countMap.getOrDefault(cat.getId(), 0L));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ForumCategory> createCategory(@RequestBody ForumCategory category) {
        return ResponseEntity.ok(forumCategoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ForumCategory> updateCategory(@PathVariable Integer id, @RequestBody ForumCategory categoryDetails) {
        return forumCategoryRepository.findById(id)
            .map(category -> {
                category.setName(categoryDetails.getName());
                category.setSlug(categoryDetails.getSlug());
                category.setStatus(categoryDetails.getStatus());
                return ResponseEntity.ok(forumCategoryRepository.save(category));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ForumCategory> updateStatus(@PathVariable Integer id, @RequestBody Map<String, Boolean> body) {
        Boolean status = body.get("status");
        return forumCategoryRepository.findById(id)
            .map(category -> {
                category.setStatus(status);
                return ResponseEntity.ok(forumCategoryRepository.save(category));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        if (!forumCategoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        forumCategoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
