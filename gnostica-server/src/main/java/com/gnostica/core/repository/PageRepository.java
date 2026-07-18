package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Page;
import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Integer> {
    Optional<Page> findBySlug(String slug);

    Optional<Page> findBySlugAndStatus(String slug, Integer status);

    List<Page> findAllByOrderByTitleAsc();
}

