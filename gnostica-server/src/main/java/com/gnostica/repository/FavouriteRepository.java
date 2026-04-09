package com.gnostica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.model.Favourite;
import com.gnostica.model.Account;
import com.gnostica.model.Course;
import java.util.List;
import java.util.Optional;

public interface FavouriteRepository extends JpaRepository<Favourite, Integer> {
    List<Favourite> findByAccount(Account account);
    Optional<Favourite> findByAccountAndCourse(Account account, Course course);
}
