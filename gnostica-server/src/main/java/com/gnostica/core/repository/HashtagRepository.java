package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Hashtag;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Integer> {
}

