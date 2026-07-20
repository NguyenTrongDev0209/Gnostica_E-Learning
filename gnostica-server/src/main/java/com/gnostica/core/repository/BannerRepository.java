package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Banner;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Integer> {
    List<Banner> findByPositionAndStatusOrderBySortOrderAsc(String position, Integer status);

    List<Banner> findAllByOrderByPositionAscSortOrderAsc();
}

