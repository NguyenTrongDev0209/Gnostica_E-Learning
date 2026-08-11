package com.gnostica.modules.adminstats;

import com.gnostica.modules.adminstats.dto.AdminStatsResponse;

public interface AdminStatsService {
    AdminStatsResponse getSupportsStats(int months);
    AdminStatsResponse getRefundsStats(int months);
    AdminStatsResponse getWithdrawalsStats(int months);
    AdminStatsResponse getThreadReportsStats(int months);
}
