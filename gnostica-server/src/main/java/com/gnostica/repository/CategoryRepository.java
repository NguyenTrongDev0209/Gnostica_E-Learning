package com.gnostica.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsBySlug(String slug);
    boolean existsByName(String name);
    List<Category> findByParentIsNull();
}
