package com.gnostica.modules.user.service;

import com.gnostica.core.model.Account;
import java.util.List;
import java.util.UUID;

public interface FollowingService {
    boolean toggleFollow(String studentEmail, UUID followeeId);
    boolean isFollowing(String studentEmail, UUID followeeId);
    List<Account> getFollowedInstructors(String studentEmail);
}
