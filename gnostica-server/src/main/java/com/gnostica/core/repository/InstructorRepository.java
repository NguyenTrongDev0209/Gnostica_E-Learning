package com.gnostica.core.repository;

import com.gnostica.core.model.Instructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Integer> {
    Optional<Instructor> findByAccountId(Integer accountId);
    Optional<Instructor> findByEmail(String email);
}
