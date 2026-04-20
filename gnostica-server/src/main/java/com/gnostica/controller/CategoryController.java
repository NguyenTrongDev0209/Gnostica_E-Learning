package com.gnostica.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gnostica.dto.request.CategoryRequest;
import com.gnostica.dto.response.ResponseDTO;
import com.gnostica.dto.response.CategoryResponseDTO;
import com.gnostica.service.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*") // Hoặc cấu hình domain cụ thể của frontend
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ResponseDTO<org.springframework.data.domain.Page<CategoryResponseDTO>>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean status
    ) {
        int jpaPage = page > 0 ? page - 1 : 0;
        org.springframework.data.domain.Page<CategoryResponseDTO> categories = categoryService.getAllCategories(jpaPage, limit, search, status);
        return ResponseEntity.ok(new ResponseDTO<>(200, "Success", categories));
    }

    @PostMapping
    public ResponseEntity<ResponseDTO<CategoryResponseDTO>> create(@Valid @RequestBody CategoryRequest request) {
        CategoryResponseDTO category = categoryService.createCategory(request);
        return ResponseEntity.ok(new ResponseDTO<CategoryResponseDTO>(201, "Category created successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDTO<CategoryResponseDTO>> update(
            @PathVariable Integer id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponseDTO category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(new ResponseDTO<CategoryResponseDTO>(200, "Category updated successfully", category));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseDTO<String>> updateStatus(
            @PathVariable Integer id,
            @RequestParam Boolean status) {
        categoryService.updateStatus(id, status);
        return ResponseEntity.ok(new ResponseDTO<String>(200, "Status updated successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO<String>> delete(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(new ResponseDTO<String>(200, "Category deleted successfully", null));
    }
}
