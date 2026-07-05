package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Vote;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Integer> {
}

