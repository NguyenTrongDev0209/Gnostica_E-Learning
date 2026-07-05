package com.gnostica.core.repository;

import com.gnostica.core.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    List<Follow> findByFollower_Email(String email);
    Optional<Follow> findByFollower_EmailAndFollowee_Id(String studentEmail, java.util.UUID instructorId);
    boolean existsByFollower_EmailAndFollowee_Id(String studentEmail, java.util.UUID instructorId);
}
