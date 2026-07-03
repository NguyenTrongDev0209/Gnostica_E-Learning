package com.gnostica.core.repository;

import com.gnostica.core.model.InstructorApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstructorApplicationRepository extends JpaRepository<InstructorApplication, Integer> {
    List<InstructorApplication> findByStatus(String status);
    Optional<InstructorApplication> findByAccount_Email(String email);
    Optional<InstructorApplication> findByAccount_Id(Integer accountId);
}
