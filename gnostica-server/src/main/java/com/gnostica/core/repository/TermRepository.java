package com.gnostica.core.repository;

import com.gnostica.core.model.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TermRepository extends JpaRepository<Term, Integer> {
    Optional<Term> findByUrlPath(String urlPath);

    Optional<Term> findByUrlPathAndStatus(String urlPath, Integer status);

    List<Term> findAllByTermModuleIdOrderBySortOrderAscTitleAsc(Integer termModuleId);

    List<Term> findAllByTermModuleIdAndStatusOrderBySortOrderAscTitleAsc(Integer termModuleId, Integer status);

    boolean existsByTermModuleId(Integer termModuleId);
}
