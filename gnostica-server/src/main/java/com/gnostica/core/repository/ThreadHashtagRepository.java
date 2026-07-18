package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.ThreadHashtag;

@Repository
public interface ThreadHashtagRepository extends JpaRepository<ThreadHashtag, Integer> {
}

