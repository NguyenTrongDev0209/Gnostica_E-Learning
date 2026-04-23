package com.gnostica.service;

import com.gnostica.model.Account;
import com.gnostica.model.Course;
import com.gnostica.model.Favourite;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.CourseRepository;
import com.gnostica.repository.FavouriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavouriteService {
    private final FavouriteRepository favouriteRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public boolean toggleFavourite(String email, Integer courseId) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        Optional<Favourite> existing = favouriteRepository.findByAccountAndCourse(account, course);

        if (existing.isPresent()) {
            favouriteRepository.delete(existing.get());
            return false; // Removed
        } else {
            Favourite favourite = new Favourite();
            favourite.setAccount(account);
            favourite.setCourse(course);
            favouriteRepository.save(favourite);
            return true; // Added
        }
    }

    @Transactional(readOnly = true)
    public List<Course> getFavouriteCourses(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        return favouriteRepository.findByAccount(account).stream()
                .map(Favourite::getCourse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isFavourite(String email, Integer courseId) {
        Account account = accountRepository.findByEmail(email).orElse(null);
        if (account == null) return false;

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return false;

        return favouriteRepository.findByAccountAndCourse(account, course).isPresent();
    }
}
