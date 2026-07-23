package com.gnostica.core.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Support;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportRepository extends JpaRepository<Support, Integer> {
    List<Support> findByAccountOrderByCreatedAtDesc(Account account);
    List<Support> findByAssigneeOrderByUpdatedAtDesc(Account assignee);
    List<Support> findByStatusOrderByUpdatedAtDesc(Integer status);
}
