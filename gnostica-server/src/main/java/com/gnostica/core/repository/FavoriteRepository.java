package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Favorite;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findByAccount(Account account);
    Optional<Favorite> findByAccountAndCourse(Account account, Course course);
}
