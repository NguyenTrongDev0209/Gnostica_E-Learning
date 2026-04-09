package com.gnostica.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.gnostica.dto.CategoryRequest;
import com.gnostica.dto.CategoryResponseDTO;
import com.gnostica.model.Category;
import com.gnostica.repository.CategoryRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;


    public Page<CategoryResponseDTO> getAllCategories(int page, int size, String search, Boolean status) {
        String safeSearch = search == null ? "" : search;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Category> categoryPage = categoryRepository.findRootCategoriesWithFilters(safeSearch, status, pageable);
        return categoryPage.map(this::mapToDTO);
    }

    
    public CategoryResponseDTO createCategory(CategoryRequest request) {

        //cat chuoi 2 dau
        //tach tung chu cua chuoi
        //ghep thanh cum viet thuong
        //viet hoa chu cai dau cua danh muc
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String formattedName = request.getName().trim().replaceAll("\\s+", " ").toLowerCase();
            request.setName(Character.toUpperCase(formattedName.charAt(0)) + formattedName.substring(1));
        }

        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug danh mục đã tồn tại");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        if (request.getParent_id() != null) {
            Category parent = categoryRepository.findById(request.getParent_id())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));
            
            // Business rule: Nếu danh mục cha ẩn, danh mục con không thể để trạng thái hoạt động
            if (!parent.getStatus() && (request.getStatus() == null || request.getStatus())) {
                throw new RuntimeException("Danh mục cha đang ẩn, không thể tạo danh mục con ở trạng thái hoạt động");
            }
            
            category.setParent(parent);
        }

        Category savedCategory = categoryRepository.save(category);
        return mapToDTO(savedCategory);
    }

    public CategoryResponseDTO updateCategory(Integer id, CategoryRequest request) {

        //cat chuoi 2 dau
        //tach tung chu cua chuoi
        //ghep thanh cum viet thuong
        //viet hoa chu cai dau cua danh muc
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            String formattedName = request.getName().trim().replaceAll("\\s+", " ").toLowerCase();
            request.setName(Character.toUpperCase(formattedName.charAt(0)) + formattedName.substring(1));
        }
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));        

        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại");
        }
        if (!category.getSlug().equals(request.getSlug()) && categoryRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug danh mục đã tồn tại");
        }

        category.setName(request.getName());
        category.setSlug(request.getSlug());
        if (request.getStatus() != null) {
            // Business rule: Nếu danh mục cha hiện tại đang ẩn, không thể bật hoạt động cho danh mục con
            if (request.getStatus() && category.getParent() != null && !category.getParent().getStatus()) {
                throw new RuntimeException("Danh mục cha đang ẩn, không thể bật hoạt động cho danh mục con");
            }

            category.setStatus(request.getStatus());
            // Business logic: Đồng bộ trạng thái của tất cả danh mục con theo danh mục cha
            if (category.getChildren() != null && !category.getChildren().isEmpty()) {
                for (Category child : category.getChildren()) {
                    child.setStatus(request.getStatus());
                }
                categoryRepository.saveAll(category.getChildren());
            }
        }

        if (request.getParent_id() != null) {
            if (request.getParent_id().equals(id)) {
                throw new RuntimeException("Danh mục không thể làm cha của chính nó");
            }
            Category parent = categoryRepository.findById(request.getParent_id())
                    .orElseThrow(() -> new RuntimeException("Danh mục cha không tồn tại"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category updatedCategory = categoryRepository.save(category);
        return mapToDTO(updatedCategory);
    }

    public void updateStatus(Integer id, Boolean status) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        // Business rule: Nếu danh mục cha hiện tại đang ẩn, không thể bật hoạt động cho danh mục con
        if (status && category.getParent() != null && !category.getParent().getStatus()) {
            throw new RuntimeException("Danh mục cha đang ẩn, không thể bật hoạt động cho danh mục con");
        }

        category.setStatus(status);
        
        // Business rule: Đồng bộ trạng thái của tất cả danh mục con theo danh mục cha
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            for (Category child : category.getChildren()) {
                child.setStatus(status);
            }
            categoryRepository.saveAll(category.getChildren());
        }
        
        categoryRepository.save(category);
    }

    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new RuntimeException("HAS_CHILDREN"); // Token đặc biệt để Frontend nhận diện và hiển thị gợi ý
        }

        // Tạm thời ẩn kiểm tra Khóa học vì chưa có Repository / Entity liên quan.
        // if (courseRepository.existsByCategoryId(id)) { throw new RuntimeException("HAS_COURSES"); }

        categoryRepository.delete(category);
    }

    private CategoryResponseDTO mapToDTO(Category category) {
        List<CategoryResponseDTO> childrenDTO = new ArrayList<>();
        if (category.getChildren() != null) {
            childrenDTO = category.getChildren().stream().map(child -> 
                CategoryResponseDTO.builder()
                    .id(child.getId())
                    .name(child.getName())
                    .slug(child.getSlug())                 
                    .courses(0)
                    .status(child.getStatus() != null ? child.getStatus() : true)
                    .createdAt(child.getCreatedAt())
                    .subcategories(new ArrayList<>())
                    .build()
            ).collect(Collectors.toList());
        }

        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())             
                .courses(0) // Mặc định = 0
                .status(category.getStatus() != null ? category.getStatus() : true)
                .createdAt(category.getCreatedAt())
                .subcategories(childrenDTO)
                .build();
    }
}
