package com.gnostica.core.repository;

import com.gnostica.core.model.TermModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TermModuleRepository extends JpaRepository<TermModule, Integer> {
    List<TermModule> findAllByOrderBySortOrderAscTitleAsc();

    List<TermModule> findAllByStatusOrderBySortOrderAscTitleAsc(Integer status);
}
