package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Topic;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Integer> {
    java.util.List<Topic> findByDeletedAtIsNull();
}

