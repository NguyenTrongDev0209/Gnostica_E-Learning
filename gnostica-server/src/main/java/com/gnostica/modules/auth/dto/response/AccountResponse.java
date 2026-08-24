package com.gnostica.modules.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.gnostica.core.model.Account;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String avatar;
    private LocalDate birthDay;
    private String provider;
    private Integer status;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer courseCount;
    private Long totalSpent;
    private Long totalRevenue;
    private Long balance;

    public static AccountResponse fromEntity(Account account) {
        if (account == null) {
            return null;
        }
        return AccountResponse.builder()
                .id(account.getId())
                .email(account.getEmail())
                .fullName(account.getFullName())
                .phone(account.getPhone())
                .avatar(account.getAvatar())
                .birthDay(account.getBirthDay())
                .provider(account.getProvider())
                .status(account.getStatus())
                .role(account.getRole() != null ? account.getRole().getName() : null)
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .courseCount(account.getCourseCount())
                .totalSpent(account.getTotalSpent())
                .totalRevenue(account.getTotalRevenue())
                .balance(account.getBalance())
                .build();
    }
}
