package com.gnostica.repository;

import com.gnostica.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    org.springframework.data.domain.Page<Course> findByAccountEmail(String email, org.springframework.data.domain.Pageable pageable);
    java.util.Optional<Course> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Integer id);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Course c WHERE c.category.id = :categoryId")
    long countByCategoryId(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Course c JOIN c.category cat LEFT JOIN cat.parent p WHERE cat.id = :categoryId OR p.id = :categoryId")
    long countByCategoryIdRecursive(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Course c SET c.status = :status WHERE c.category.id = :categoryId OR c.category.parent.id = :categoryId")
    void syncCourseStatusWithCategory(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId, @org.springframework.data.repository.query.Param("status") Integer status);
    
    boolean existsByCategoryId(Integer categoryId);

    @org.springframework.data.jpa.repository.Query("SELECT c.category.id, COUNT(c) FROM Course c WHERE c.category.id IN :categoryIds GROUP BY c.category.id")
    java.util.List<Object[]> countCoursesByCategoryIdIn(@org.springframework.data.repository.query.Param("categoryIds") java.util.Collection<Integer> categoryIds);
}
