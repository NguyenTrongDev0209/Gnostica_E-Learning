package com.gnostica.repository;

import com.gnostica.model.Banks;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BanksRepository extends JpaRepository<Banks, Long> {
    Optional<Banks> findByExternalId(Integer externalId);
}
