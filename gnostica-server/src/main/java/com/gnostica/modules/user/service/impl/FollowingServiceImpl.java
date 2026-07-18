package com.gnostica.modules.user.service.impl;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Follow;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.FollowRepository;
import com.gnostica.modules.user.service.FollowingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FollowingServiceImpl implements FollowingService {

    private final FollowRepository followRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public boolean toggleFollow(String studentEmail, UUID followeeId) {
        Account student = accountRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Học viên không tồn tại"));

        if (student.getId().equals(followeeId)) {
            throw new RuntimeException("Bạn không thể theo dõi chính bản thân mình");
        }

        Optional<Follow> existing = followRepository.findByFollower_EmailAndFollowee_Id(studentEmail, followeeId);
        
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return false;
        } else {
            Account instructor = accountRepository.findById(followeeId)
                    .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại"));
            
            Follow follow = Follow.builder()
                    .follower(student)
                    .followee(instructor)
                    .build();
            followRepository.save(follow);
            return true;
        }
    }

    @Override
    public boolean isFollowing(String studentEmail, UUID followeeId) {
        return followRepository.existsByFollower_EmailAndFollowee_Id(studentEmail, followeeId);
    }

    @Override
    public List<Account> getFollowedInstructors(String studentEmail) {
        return followRepository.findByFollower_Email(studentEmail).stream()
                .map(Follow::getFollowee)
                .collect(Collectors.toList());
    }
}
