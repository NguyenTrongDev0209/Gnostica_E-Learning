package com.gnostica.core.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gnostica.core.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Integer id);
    boolean existsByName(String name);
    List<Category> findByParentIsNull();

    @Query("SELECT DISTINCT c FROM Category c LEFT JOIN c.children ch " +
           "WHERE c.parent IS NULL " +
           "AND (CAST(:status AS integer) IS NULL OR c.status = :status) " +
           "AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.slug) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(ch.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(ch.slug) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Category> findRootCategoriesWithFilters(@Param("search") String search, @Param("status") Integer status, Pageable pageable);
}
