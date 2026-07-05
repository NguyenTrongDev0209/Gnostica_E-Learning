package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Banner;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {
}

