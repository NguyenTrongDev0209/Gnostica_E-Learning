package com.gnostica.modules.course.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashMap;
import java.util.HashSet;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gnostica.modules.course.dto.request.CategoryRequest;
import com.gnostica.modules.course.dto.response.CategoryResponseDTO;
import com.gnostica.core.model.Category;
import com.gnostica.core.repository.CategoryRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.gnostica.core.repository.CourseRepository courseRepository;


    @Transactional(readOnly = true)
    public Page<CategoryResponseDTO> getAllCategories(int page, int size, String search, Boolean status) {
        String safeSearch = search == null ? "" : search;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Category> categoryPage = categoryRepository.findRootCategoriesWithFilters(safeSearch, status, pageable);
        
        // --- Tối ưu N+1: Thu thập tất cả ID cần đếm ---
        Set<Integer> allIds = new HashSet<>();
        for (Category root : categoryPage.getContent()) {
            allIds.add(root.getId());
            if (root.getChildren() != null) {
                root.getChildren().forEach(child -> allIds.add(child.getId()));
            }
        }
        
        // Truy vấn số lượng khóa học trực tiếp cho tất cả ID trong 1 query
        Map<Integer, Long> courseCountsMap = new HashMap<>();
        if (!allIds.isEmpty()) {
            List<Object[]> results = courseRepository.countCoursesByCategoryIdIn(allIds);
            for (Object[] result : results) {
                courseCountsMap.put((Integer) result[0], (Long) result[1]);
            }
        }
        
        return categoryPage.map(category -> mapToDTO(category, courseCountsMap));
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
        
        // Tự động xử lý trùng slug bằng cách thêm hậu tố số
        String uniqueSlug = generateUniqueSlug(request.getSlug(), null);
        request.setSlug(uniqueSlug);

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
        
        // Tự động xử lý trùng slug bằng cách thêm hậu tố số
        String uniqueSlug = generateUniqueSlug(request.getSlug(), id);
        request.setSlug(uniqueSlug);

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

    @Transactional
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

        // Rule 2: Đồng bộ trạng thái khóa học theo danh mục (1: Hiện, 2: Ẩn)
        int courseStatus = status ? 1 : 2;
        courseRepository.syncCourseStatusWithCategory(id, courseStatus);
        
        categoryRepository.save(category);
    }

    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new RuntimeException("HAS_CHILDREN"); // Token đặc biệt để Frontend nhận diện và hiển thị gợi ý
        }

        if (courseRepository.countByCategoryIdRecursive(id) > 0) {
            throw new RuntimeException("HAS_COURSES");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponseDTO mapToDTO(Category category) {
        return mapToDTO(category, null);
    }

    private CategoryResponseDTO mapToDTO(Category category, Map<Integer, Long> countsMap) {
        List<CategoryResponseDTO> childrenDTO = new ArrayList<>();
        
        // Tính tổng số lượng khóa học đệ quy (Recursive)
        // Nếu có countsMap thì dùng Map để tránh query database (Tối ưu N+1)
        long directCount = (countsMap != null) 
            ? countsMap.getOrDefault(category.getId(), 0L) 
            : courseRepository.countByCategoryId(category.getId());
            
        long recursiveTotal = directCount;

        if (category.getChildren() != null) {
            for (Category child : category.getChildren()) {
                long childCount = (countsMap != null)
                    ? countsMap.getOrDefault(child.getId(), 0L)
                    : courseRepository.countByCategoryId(child.getId());
                
                recursiveTotal += childCount;
                
                childrenDTO.add(CategoryResponseDTO.builder()
                    .id(child.getId())
                    .name(child.getName())
                    .slug(child.getSlug())                 
                    .courses((int) childCount)
                    .status(child.getStatus() != null ? child.getStatus() : true)
                    .createdAt(child.getCreatedAt())
                    .subcategories(new ArrayList<>())
                    .build());
            }
        }

        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())             
                .courses((int) recursiveTotal)
                .status(category.getStatus() != null ? category.getStatus() : true)
                .createdAt(category.getCreatedAt())
                .subcategories(childrenDTO)
                .build();
    }

    private String generateUniqueSlug(String baseSlug, Integer id) {
        String slug = baseSlug;
        int count = 1;
        
        while (id == null ? categoryRepository.existsBySlug(slug) : categoryRepository.existsBySlugAndIdNot(slug, id)) {
            slug = baseSlug + "-" + count;
            count++;
        }
        
        return slug;
    }
}
