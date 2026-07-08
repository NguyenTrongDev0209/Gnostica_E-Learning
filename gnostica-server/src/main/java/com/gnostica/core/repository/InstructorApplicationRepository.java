package com.gnostica.core.repository;

import com.gnostica.core.model.InstructorApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstructorApplicationRepository extends JpaRepository<InstructorApplication, Integer> {
    Optional<InstructorApplication> findByAccount_Id(UUID accountId);
    List<InstructorApplication> findByStatus(String status);
}
