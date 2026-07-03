package com.gnostica.core.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Following;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowingRepository extends JpaRepository<Following, Integer> {
    List<Following> findByStudentEmail(String email);
    Optional<Following> findByStudentEmailAndInstructorId(String studentEmail, Integer instructorId);
    boolean existsByStudentEmailAndInstructorId(String studentEmail, Integer instructorId);
}
