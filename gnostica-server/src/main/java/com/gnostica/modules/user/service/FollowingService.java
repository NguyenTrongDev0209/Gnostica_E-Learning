package com.gnostica.modules.user.service;

import com.gnostica.core.model.Account;
import java.util.List;

public interface FollowingService {
    boolean toggleFollow(String studentEmail, Integer instructorId);
    boolean isFollowing(String studentEmail, Integer instructorId);
    List<Account> getFollowedInstructors(String studentEmail);
}
