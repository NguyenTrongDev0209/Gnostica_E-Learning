package com.gnostica.core.repository;

import com.gnostica.core.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    java.util.List<Course> findAllByIdInAndDeletedAtIsNull(java.util.Collection<UUID> ids);
    java.util.List<Course> findAllByDeletedAtIsNull();
    org.springframework.data.domain.Page<Course> findByAccountEmailAndDeletedAtIsNull(String email, org.springframework.data.domain.Pageable pageable);
    java.util.Optional<Course> findFirstBySlugAndDeletedAtIsNullOrderByIdDesc(String slug);
    java.util.Optional<Course> findFirstBySlugOrderByIdDesc(String slug);
    java.util.Optional<Course> findFirstByOriginalCourseAndDeletedAtIsNullOrderByIdDesc(Course originalCourse);
    boolean existsBySlugAndDeletedAtIsNull(String slug);
    boolean existsBySlugAndIdNotAndDeletedAtIsNull(String slug, java.util.UUID id);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, java.util.UUID id);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) > 0 FROM Course c WHERE c.promoVideo = :promoVideo AND c.deletedAt IS NULL")
    boolean existsByPromoVideo(@org.springframework.data.repository.query.Param("promoVideo") String promoVideo);
    
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT c FROM Course c LEFT JOIN c.category cat LEFT JOIN cat.parent p WHERE c.account.email = :email " +
                "AND (CAST(:search AS String) IS NULL OR LOWER(c.title) LIKE :search) " +
                "AND (CAST(:categoryId AS integer) IS NULL OR cat.id = :categoryId OR p.id = :categoryId) " +
                "AND (CAST(:status AS integer) IS NULL OR c.status = :status) " +
                "AND c.deletedAt IS NULL AND c.originalCourse IS NULL",
        countQuery = "SELECT COUNT(c) FROM Course c LEFT JOIN c.category cat LEFT JOIN cat.parent p WHERE c.account.email = :email " +
                     "AND (CAST(:search AS String) IS NULL OR LOWER(c.title) LIKE :search) " +
                     "AND (CAST(:categoryId AS integer) IS NULL OR cat.id = :categoryId OR p.id = :categoryId) " +
                     "AND (CAST(:status AS integer) IS NULL OR c.status = :status) " +
                     "AND c.deletedAt IS NULL AND c.originalCourse IS NULL"
    )
    org.springframework.data.domain.Page<Course> findInstructorCourses(
            @org.springframework.data.repository.query.Param("email") String email,
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("categoryId") Integer categoryId,
            @org.springframework.data.repository.query.Param("status") Integer status,
            org.springframework.data.domain.Pageable pageable);
    
    long countByAccount_IdAndStatus(UUID accountId, Integer status);
    java.util.List<Course> findByAccount_IdAndStatus(UUID accountId, Integer status);
    long countByAccountIdAndStatus(UUID accountId, Integer status);
    long countByAccountId(UUID accountId);
    java.util.List<Course> findByAccountIdAndStatus(UUID accountId, Integer status);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(SIZE(c.enrollments)), 0) FROM Course c WHERE c.account.id = :accountId")
    long countStudentsByInstructorId(@org.springframework.data.repository.query.Param("accountId") UUID accountId);

    org.springframework.data.domain.Page<Course> findByStatusAndDeletedAtIsNull(Integer status, org.springframework.data.domain.Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Course c WHERE c.category.id = :categoryId")
    long countByCategoryId(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM Course c JOIN c.category cat LEFT JOIN cat.parent p WHERE cat.id = :categoryId OR p.id = :categoryId")
    long countByCategoryIdRecursive(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Course c SET c.status = :status WHERE c.category.id = :categoryId OR c.category.parent.id = :categoryId")
    void syncCourseStatusWithCategory(@org.springframework.data.repository.query.Param("categoryId") Integer categoryId, @org.springframework.data.repository.query.Param("status") Integer status);
    
    boolean existsByCategory_Id(Integer categoryId);

    @org.springframework.data.jpa.repository.Query(
            value = "SELECT c FROM Course c JOIN FETCH c.account JOIN FETCH c.category cat LEFT JOIN cat.parent parent " +
                    "WHERE c.status = 1 AND cat.status = 1 AND (parent IS NULL OR parent.status = 1) " +
                    "AND (:categoryId = -1 OR cat.id = :categoryId OR parent.id = :categoryId) " +
                    "AND (:filterCategorySlugs = false OR cat.slug IN :categorySlugs OR parent.slug IN :categorySlugs) " +
                    "AND (:filterLevels = false OR LOWER(c.level) IN :levels) " +
                    "AND (:minPrice < 0 OR (c.price * (100 - COALESCE(c.discount, 0)) / 100) >= :minPrice) " +
                    "AND (:maxPrice < 0 OR (c.price * (100 - COALESCE(c.discount, 0)) / 100) <= :maxPrice) " +
                    "AND (:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "OR LOWER(cat.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "OR LOWER(c.account.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                    "AND c.deletedAt IS NULL",
            countQuery = "SELECT COUNT(c) FROM Course c JOIN c.category cat LEFT JOIN cat.parent parent " +
                    "WHERE c.status = 1 AND cat.status = 1 AND (parent IS NULL OR parent.status = 1) " +
                    "AND (:categoryId = -1 OR cat.id = :categoryId OR parent.id = :categoryId) " +
                    "AND (:filterCategorySlugs = false OR cat.slug IN :categorySlugs OR parent.slug IN :categorySlugs) " +
                    "AND (:filterLevels = false OR LOWER(c.level) IN :levels) " +
                    "AND (:minPrice < 0 OR (c.price * (100 - COALESCE(c.discount, 0)) / 100) >= :minPrice) " +
                    "AND (:maxPrice < 0 OR (c.price * (100 - COALESCE(c.discount, 0)) / 100) <= :maxPrice) " +
                    "AND (:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "OR LOWER(cat.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                    "OR LOWER(c.account.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                    "AND c.deletedAt IS NULL")
    org.springframework.data.domain.Page<Course> findPublicCourses(
            @org.springframework.data.repository.query.Param("categoryId") Integer categoryId,
            @org.springframework.data.repository.query.Param("filterCategorySlugs") boolean filterCategorySlugs,
            @org.springframework.data.repository.query.Param("categorySlugs") java.util.Collection<String> categorySlugs,
            @org.springframework.data.repository.query.Param("filterLevels") boolean filterLevels,
            @org.springframework.data.repository.query.Param("levels") java.util.Collection<String> levels,
            @org.springframework.data.repository.query.Param("minPrice") java.math.BigDecimal minPrice,
            @org.springframework.data.repository.query.Param("maxPrice") java.math.BigDecimal maxPrice,
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT c.level FROM Course c WHERE c.status = 1 AND c.deletedAt IS NULL AND c.level IS NOT NULL")
    java.util.List<String> findDistinctPublicLevels();

    @org.springframework.data.jpa.repository.Query("SELECT c.category.id, COUNT(c) FROM Course c WHERE c.category.id IN :categoryIds GROUP BY c.category.id")
    java.util.List<Object[]> countCoursesByCategoryIdIn(@org.springframework.data.repository.query.Param("categoryIds") java.util.Collection<Integer> categoryIds);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c LEFT JOIN Review r ON r.course = c WHERE c.status = 1 AND c.deletedAt IS NULL GROUP BY c.id ORDER BY AVG(r.rating) DESC NULLS LAST")
    java.util.List<Course> findTop5ByAverageRating(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Course c WHERE c.status = 1 AND c.deletedAt IS NULL " +
            "AND (CAST(:categoryName AS String) IS NULL OR LOWER(c.category.name) LIKE LOWER(CONCAT('%', :categoryName, '%'))) " +
            "AND (CAST(:maxPrice AS double) IS NULL OR c.price <= :maxPrice)")
    java.util.List<Course> findCoursesByCategoryAndPrice(
            @org.springframework.data.repository.query.Param("categoryName") String categoryName, 
            @org.springframework.data.repository.query.Param("maxPrice") Double maxPrice, 
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT DISTINCT c FROM Course c LEFT JOIN FETCH c.account LEFT JOIN FETCH c.category cat LEFT JOIN cat.parent parent " +
                "WHERE (:status = -1 OR c.status = :status) " +
                "AND (:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                "AND (:categoryId = -1 OR cat.id = :categoryId OR parent.id = :categoryId) " +
                "AND c.deletedAt IS NULL",
        countQuery = "SELECT COUNT(c) FROM Course c LEFT JOIN c.category cat LEFT JOIN cat.parent parent " +
                     "WHERE (:status = -1 OR c.status = :status) " +
                     "AND (:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                     "AND (:categoryId = -1 OR cat.id = :categoryId OR parent.id = :categoryId) " +
                     "AND c.deletedAt IS NULL"
    )
    org.springframework.data.domain.Page<Course> findModerationCourses(
            @org.springframework.data.repository.query.Param("status") Integer status,
            @org.springframework.data.repository.query.Param("search") String search,
            @org.springframework.data.repository.query.Param("categoryId") Integer categoryId,
            org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(
        "SELECT c.status, COUNT(c) FROM Course c " +
        "WHERE c.deletedAt IS NULL " +
        "GROUP BY c.status"
    )
    java.util.List<Object[]> countModerationStats();
    @org.springframework.data.jpa.repository.Query(
        value = "SELECT c FROM Course c JOIN FETCH c.account JOIN FETCH c.category cat LEFT JOIN cat.parent parent " +
                "WHERE c.status = 1 AND cat.status = 1 AND (parent IS NULL OR parent.status = 1) AND c.deletedAt IS NULL " +
                "AND (:filterLevel = false OR c.level = :level) " +
                "AND (:filterCategory = false OR cat.id IN :categoryIds OR parent.id IN :categoryIds)",
        countQuery = "SELECT COUNT(c) FROM Course c JOIN c.category cat LEFT JOIN cat.parent parent " +
                "WHERE c.status = 1 AND cat.status = 1 AND (parent IS NULL OR parent.status = 1) AND c.deletedAt IS NULL " +
                "AND (:filterLevel = false OR c.level = :level) " +
                "AND (:filterCategory = false OR cat.id IN :categoryIds OR parent.id IN :categoryIds)"
    )
    org.springframework.data.domain.Page<Course> findRecommendedCourses(
            @org.springframework.data.repository.query.Param("filterLevel") boolean filterLevel,
            @org.springframework.data.repository.query.Param("level") String level,
            @org.springframework.data.repository.query.Param("filterCategory") boolean filterCategory,
            @org.springframework.data.repository.query.Param("categoryIds") java.util.Collection<Integer> categoryIds,
            org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Course> findByAccountIdAndDeletedAtIsNullAndOriginalCourseIsNull(java.util.UUID accountId, org.springframework.data.domain.Pageable pageable);
}
