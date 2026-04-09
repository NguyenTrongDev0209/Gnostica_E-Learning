package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.model.ForumCategory;

@Repository
public interface ForumCategoryRepository extends JpaRepository<ForumCategory, Integer> {
}
