package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.ReplyTemplate;
import java.util.List;

public interface ReplyTemplateRepository extends JpaRepository<ReplyTemplate, Integer> {
    List<ReplyTemplate> findByAccountEmailOrderByCreatedAtAsc(String instructorEmail);
}
