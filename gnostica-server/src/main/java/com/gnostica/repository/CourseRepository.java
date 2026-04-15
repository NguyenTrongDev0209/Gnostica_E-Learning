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
    
    long countByAccountIdAndStatus(Integer accountId, Integer status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(SIZE(c.enrollments)), 0) FROM Course c WHERE c.account.id = :accountId")
    long countStudentsByInstructorId(@org.springframework.data.repository.query.Param("accountId") Integer accountId);

    org.springframework.data.domain.Page<Course> findByStatus(Integer status, org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Course c WHERE c.category.id = :categoryId")
    long countByCategoryId(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Course c JOIN c.category cat LEFT JOIN cat.parent p WHERE cat.id = :categoryId OR p.id = :categoryId")
    long countByCategoryIdRecursive(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Course c SET c.status = :status WHERE c.category.id = :categoryId OR c.category.parent.id = :categoryId")
    void syncCourseStatusWithCategory(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId, @org.springframework.data.repository.query.Param("status") Integer status);
    
    boolean existsByCategoryId(Integer categoryId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c JOIN FETCH c.account JOIN FETCH c.category WHERE c.status = 1 " +
            "AND (:categoryId IS NULL OR c.category.id = :categoryId OR c.category.parent.id = :categoryId) " +
            "AND (:categorySlug IS NULL OR c.category.slug = :categorySlug OR c.category.parent.slug = :categorySlug) " +
            "AND (:level IS NULL OR c.level = :level)")
    org.springframework.data.domain.Page<Course> findPublicCourses(
            @org.springframework.data.repository.query.Param("categoryId") Integer categoryId,
            @org.springframework.data.repository.query.Param("categorySlug") String categorySlug,
            @org.springframework.data.repository.query.Param("level") String level,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c.category.id, COUNT(c) FROM Course c WHERE c.category.id IN :categoryIds GROUP BY c.category.id")
    java.util.List<Object[]> countCoursesByCategoryIdIn(@org.springframework.data.repository.query.Param("categoryIds") java.util.Collection<Integer> categoryIds);
}
