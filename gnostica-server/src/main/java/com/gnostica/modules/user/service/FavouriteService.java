package com.gnostica.modules.user.service;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Course;
import com.gnostica.core.model.Favorite;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.FavoriteRepository;
import com.gnostica.modules.course.dto.response.CourseResponse;
import com.gnostica.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FavouriteService {
    private final FavoriteRepository favoriteRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final CourseService courseService;

    @Transactional
    public boolean toggleFavourite(String email, UUID courseId) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        Optional<Favorite> existing = favoriteRepository.findByAccountAndCourse(account, course);

        if (existing.isPresent()) {
            Favorite favorite = existing.get();
            if (favorite.getStatus() == 1) {
                favorite.setStatus(0); // Removed
                favoriteRepository.save(favorite);
                return false;
            } else {
                favorite.setStatus(1); // Active
                favoriteRepository.save(favorite);
                return true;
            }
        } else {
            Favorite favorite = new Favorite();
            favorite.setAccount(account);
            favorite.setCourse(course);
            favorite.setStatus(1); // Active
            favoriteRepository.save(favorite);
            return true; // Added
        }
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getFavouriteCourses(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));
        
        return favoriteRepository.findByAccount(account).stream()
                .filter(fav -> fav.getStatus() != null && fav.getStatus() == 1)
                .map(Favorite::getCourse)
                .filter(Objects::nonNull)
                .map(courseService::mapToCourseResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isFavourite(String email, UUID courseId) {
        Account account = accountRepository.findByEmail(email).orElse(null);
        if (account == null) return false;

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) return false;

        Optional<Favorite> existing = favoriteRepository.findByAccountAndCourse(account, course);
        return existing.isPresent() && existing.get().getStatus() == 1;
    }
}
