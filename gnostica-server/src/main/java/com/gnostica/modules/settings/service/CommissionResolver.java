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
    private final SystemSettingsService settingsService;

    public ResolvedCommission resolve(Account instructor, LocalDateTime at) {
        Commission override = commissionRepository.findByAccountAndStatusOrderByValidFromDesc(instructor, 1)
                .stream()
                .filter(item -> (item.getValidFrom() == null || !item.getValidFrom().isAfter(at))
                        && (item.getValidUntil() == null || item.getValidUntil().isAfter(at)))
                .findFirst()
                .orElse(null);

        if (override != null && override.getInstructorRatio().add(override.getPlatformRatio()).compareTo(new BigDecimal("100")) == 0) {
            return new ResolvedCommission(override.getInstructorRatio(), override.getPlatformRatio(), override);
        }

        BigDecimal instructorRatio = settingsService.getDecimal("finance.instructor_ratio", new BigDecimal("90"));
        BigDecimal platformRatio = settingsService.getDecimal("finance.platform_ratio", new BigDecimal("10"));
        if (instructorRatio.add(platformRatio).compareTo(new BigDecimal("100")) != 0) {
            instructorRatio = new BigDecimal("90");
            platformRatio = new BigDecimal("10");
        }
        return new ResolvedCommission(instructorRatio, platformRatio, null);
    }

    public record ResolvedCommission(BigDecimal instructorRatio, BigDecimal platformRatio, Commission source) {
    }
}
