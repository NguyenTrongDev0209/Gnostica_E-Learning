package com.gnostica.repository;

import com.gnostica.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    org.springframework.data.domain.Page<Course> findByAccountEmailAndDeletedFalse(String email, org.springframework.data.domain.Pageable pageable);
    java.util.Optional<Course> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Integer id);
    
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT c FROM Course c LEFT JOIN c.category cat LEFT JOIN cat.parent p WHERE c.account.email = :email " +
                "AND (CAST(:search AS String) IS NULL OR LOWER(c.title) LIKE :search) " +
                "AND (:categoryId IS NULL OR cat.id = :categoryId OR p.id = :categoryId) " +
                "AND (:status IS NULL OR c.status = :status) " +
                "AND (c.deleted = false OR c.deleted IS NULL)",
        countQuery = "SELECT COUNT(c) FROM Course c LEFT JOIN c.category cat LEFT JOIN cat.parent p WHERE c.account.email = :email " +
                     "AND (CAST(:search AS String) IS NULL OR LOWER(c.title) LIKE :search) " +
                     "AND (:categoryId IS NULL OR cat.id = :categoryId OR p.id = :categoryId) " +
                     "AND (:status IS NULL OR c.status = :status) " +
                     "AND (c.deleted = false OR c.deleted IS NULL)"
    )
    org.springframework.data.domain.Page<Course> findInstructorCourses(
            @org.springframework.data.repository.query.Param("email") String email,
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("categoryId") Integer categoryId,
            @org.springframework.data.repository.query.Param("status") Integer status,
            org.springframework.data.domain.Pageable pageable);
    
    long countByAccountIdAndStatus(Integer accountId, Integer status);
    java.util.List<Course> findByAccountIdAndStatus(Integer accountId, Integer status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(SIZE(c.enrollments)), 0) FROM Course c WHERE c.account.id = :accountId")
    long countStudentsByInstructorId(@org.springframework.data.repository.query.Param("accountId") Integer accountId);

    org.springframework.data.domain.Page<Course> findByStatusAndDeletedFalse(Integer status, org.springframework.data.domain.Pageable pageable);
    
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
            "AND (:level IS NULL OR c.level = :level) " +
            "AND (c.deleted = false OR c.deleted IS NULL)")
    org.springframework.data.domain.Page<Course> findPublicCourses(
            @org.springframework.data.repository.query.Param("categoryId") Integer categoryId,
            @org.springframework.data.repository.query.Param("categorySlug") String categorySlug,
            @org.springframework.data.repository.query.Param("level") String level,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c.category.id, COUNT(c) FROM Course c WHERE c.category.id IN :categoryIds GROUP BY c.category.id")
    java.util.List<Object[]> countCoursesByCategoryIdIn(@org.springframework.data.repository.query.Param("categoryIds") java.util.Collection<Integer> categoryIds);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c LEFT JOIN Review r ON r.course = c WHERE c.status = 1 AND (c.deleted = false OR c.deleted IS NULL) GROUP BY c.id ORDER BY AVG(r.rating) DESC NULLS LAST")
    java.util.List<Course> findTop5ByAverageRating(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c WHERE c.status = 1 AND (c.deleted = false OR c.deleted IS NULL) " +
            "AND (:categoryName IS NULL OR LOWER(c.category.name) LIKE LOWER(CONCAT('%', :categoryName, '%'))) " +
            "AND (:maxPrice IS NULL OR c.price <= :maxPrice)")
    java.util.List<Course> findCoursesByCategoryAndPrice(
            @org.springframework.data.repository.query.Param("categoryName") String categoryName, 
            @org.springframework.data.repository.query.Param("maxPrice") Double maxPrice, 
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.account LEFT JOIN FETCH c.category " +
                "WHERE (:status IS NULL OR c.status = :status) " +
                "AND (c.deleted = false OR c.deleted IS NULL)",
        countQuery = "SELECT COUNT(c) FROM Course c " +
                     "WHERE (:status IS NULL OR c.status = :status) " +
                     "AND (c.deleted = false OR c.deleted IS NULL)"
    )
    org.springframework.data.domain.Page<Course> findModerationCourses(
            @org.springframework.data.repository.query.Param("status") Integer status,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
        "SELECT c.status, COUNT(c) FROM Course c " +
        "WHERE (c.deleted = false OR c.deleted IS NULL) " +
        "GROUP BY c.status"
    )
    java.util.List<Object[]> countModerationStats();
}
