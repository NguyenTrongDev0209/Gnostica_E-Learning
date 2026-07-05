package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Page;

@Repository
public interface PageRepository extends JpaRepository<Page, Integer> {
}

