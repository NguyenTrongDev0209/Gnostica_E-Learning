package com.gnostica.repository;

import com.gnostica.model.Account;
import com.gnostica.model.Thread;
import com.gnostica.model.ThreadLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThreadLikeRepository extends JpaRepository<ThreadLike, Integer> {
    Optional<ThreadLike> findByThreadAndAccount(Thread thread, Account account);
    boolean existsByThreadAndAccount(Thread thread, Account account);
}
