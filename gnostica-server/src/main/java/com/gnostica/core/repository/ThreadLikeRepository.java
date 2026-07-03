package com.gnostica.core.repository;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Thread;
import com.gnostica.core.model.ThreadLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThreadLikeRepository extends JpaRepository<ThreadLike, Integer> {
    Optional<ThreadLike> findByThreadAndAccount(Thread thread, Account account);
    boolean existsByThreadAndAccount(Thread thread, Account account);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    void deleteByThreadId(Integer threadId);
}
