package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Vote;
import com.gnostica.core.model.Account;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Integer> {
    Optional<Vote> findByAccountAndTargetIdAndType(Account account, String targetId, Integer type);
    boolean existsByAccountAndTargetIdAndType(Account account, String targetId, Integer type);
    void deleteByTargetIdAndType(String targetId, Integer type);
}

