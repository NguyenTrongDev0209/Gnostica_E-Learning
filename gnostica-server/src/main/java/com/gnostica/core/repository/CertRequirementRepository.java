package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.CertRequirement;

@Repository
public interface CertRequirementRepository extends JpaRepository<CertRequirement, Integer> {
}

