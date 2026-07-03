package com.gnostica.modules.user.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Following;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.FollowingRepository;
import com.gnostica.modules.user.service.FollowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowingServiceImpl implements FollowingService {

    private final FollowingRepository followingRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public boolean toggleFollow(String studentEmail, Integer instructorId) {
        Account student = accountRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Học viên không tồn tại"));

        if (student.getId().equals(instructorId)) {
            throw new RuntimeException("Bạn không thể theo dõi chính bản thân mình");
        }

        Optional<Following> existing = followingRepository.findByStudentEmailAndInstructorId(studentEmail, instructorId);
        
        if (existing.isPresent()) {
            followingRepository.delete(existing.get());
            return false;
        } else {
            Account instructor = accountRepository.findById(instructorId)
                    .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại"));
            
            Following following = Following.builder()
                    .student(student)
                    .instructor(instructor)
                    .build();
            followingRepository.save(following);
            return true;
        }
    }

    @Override
    public boolean isFollowing(String studentEmail, Integer instructorId) {
        return followingRepository.existsByStudentEmailAndInstructorId(studentEmail, instructorId);
    }

    @Override
    public List<Account> getFollowedInstructors(String studentEmail) {
        return followingRepository.findByStudentEmail(studentEmail).stream()
                .map(Following::getInstructor)
                .collect(Collectors.toList());
    }
}
