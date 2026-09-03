package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Vote;
import com.gnostica.core.model.Account;
import java.util.Optional;
import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Integer> {
    List<Vote> findByAccountEmailAndType(String email, Integer type);
    Optional<Vote> findByAccountAndTargetIdAndType(Account account, String targetId, Integer type);

    boolean existsByAccountAndTargetIdAndType(Account account, String targetId, Integer type);

    long countByTargetIdAndTypeAndValue(String targetId, Integer type, Boolean value);

    void deleteByTargetIdAndType(String targetId, Integer type);
}
