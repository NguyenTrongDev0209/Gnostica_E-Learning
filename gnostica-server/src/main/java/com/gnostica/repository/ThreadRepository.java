package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gnostica.model.Thread;

@Repository
public interface ThreadRepository extends JpaRepository<Thread, Integer> {
}
