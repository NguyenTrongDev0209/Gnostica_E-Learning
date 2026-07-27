package com.gnostica.modules.settings.service;

import com.gnostica.core.model.Account;
import com.gnostica.core.model.Commission;
import com.gnostica.core.repository.CommissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommissionResolver {
    private final CommissionRepository commissionRepository;

    public ResolvedCommission resolve(Account instructor, LocalDateTime at) {
        Commission global = commissionRepository.findAllByOrderByValidFromDesc()
                .stream()
                .filter(item -> item.getStatus() == 1
                        && (item.getValidFrom() == null || !item.getValidFrom().isAfter(at))
                        && (item.getValidUntil() == null || item.getValidUntil().isAfter(at)))
                .findFirst()
                .orElse(null);

        if (global != null && global.getInstructorRatio().add(global.getPlatformRatio()).compareTo(new BigDecimal("100")) == 0) {
            return new ResolvedCommission(global.getInstructorRatio(), global.getPlatformRatio(), global);
        }

        BigDecimal instructorRatio = new BigDecimal("90");
        BigDecimal platformRatio = new BigDecimal("10");
        return new ResolvedCommission(instructorRatio, platformRatio, null);
    }

    public record ResolvedCommission(BigDecimal instructorRatio, BigDecimal platformRatio, Commission source) {
    }
}
