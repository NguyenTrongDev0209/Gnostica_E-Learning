package com.gnostica.modules.adminstats;

import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.core.repository.RefundRepository;
import com.gnostica.core.repository.ReportRepository;
import com.gnostica.core.repository.SupportRepository;
import com.gnostica.modules.adminstats.dto.AdminStatsResponse;
import com.gnostica.modules.adminstats.dto.KeyCountDTO;
import com.gnostica.modules.adminstats.dto.TrendPointDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminStatsServiceImpl implements AdminStatsService {

    private final SupportRepository supportRepository;
    private final RefundRepository refundRepository;
    private final PayoutRepository payoutRepository;
    private final ReportRepository reportRepository;

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy");

    @Override
    public AdminStatsResponse getSupportsStats(int months) {
        int clampedMonths = clampMonths(months);
        LocalDateTime startDate = LocalDateTime.now().minusMonths(clampedMonths - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<Object[]> data = supportRepository.getAdminStatsProjection(startDate);
        
        Map<String, String> statusLabels = Map.of(
            "0", "Mở",
            "1", "Đang xử lý",
            "2", "Chờ phản hồi",
            "3", "Đã giải quyết",
            "4", "Đã đóng",
            "5", "Spam"
        );

        AdminStatsResponse response = buildResponse(data, startDate, clampedMonths, statusLabels, false);
        
        // Build type & priority distribution
        Map<String, Long> typeCounts = new HashMap<>();
        Map<String, Long> priorityCounts = new HashMap<>();
        
        for (Object[] row : data) {
            if (row == null) continue;
            String type = (String) row[2];
            Integer priority = (Integer) row[3];
            
            String typeKey = (type == null || type.isEmpty()) ? "Khác" : type;
            typeCounts.merge(typeKey, 1L, Long::sum);
            
            String priorityKey = String.valueOf(priority != null ? priority : 0);
            priorityCounts.merge(priorityKey, 1L, Long::sum);
        }
        
        Map<String, String> priorityLabels = Map.of(
            "1", "Thấp",
            "2", "Trung bình",
            "3", "Cao",
            "4", "Khẩn cấp",
            "0", "Không rõ"
        );
        
        response.setTypeDistribution(toKeyCountList(typeCounts, null));
        response.setPriorityDistribution(toKeyCountList(priorityCounts, priorityLabels));
        
        return response;
    }

    @Override
    public AdminStatsResponse getRefundsStats(int months) {
        int clampedMonths = clampMonths(months);
        LocalDateTime startDate = LocalDateTime.now().minusMonths(clampedMonths - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<Object[]> data = refundRepository.getAdminStatsProjection(startDate);
        
        Map<String, String> statusLabels = Map.of(
            "1", "Chờ xử lý",
            "2", "Đã hoàn tiền",
            "3", "Từ chối"
        );

        return buildResponse(data, startDate, clampedMonths, statusLabels, true);
    }

    @Override
    public AdminStatsResponse getWithdrawalsStats(int months) {
        int clampedMonths = clampMonths(months);
        LocalDateTime startDate = LocalDateTime.now().minusMonths(clampedMonths - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<Object[]> data = payoutRepository.getAdminStatsProjection(startDate);
        
        Map<String, String> statusLabels = Map.of(
            "1", "Chờ duyệt",
            "2", "Đang chuyển",
            "3", "Hoàn tất",
            "4", "Lỗi",
            "5", "Từ chối"
        );

        return buildResponse(data, startDate, clampedMonths, statusLabels, true);
    }

    @Override
    public AdminStatsResponse getThreadReportsStats(int months) {
        int clampedMonths = clampMonths(months);
        LocalDateTime startDate = LocalDateTime.now().minusMonths(clampedMonths - 1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        List<Object[]> data = reportRepository.getAdminStatsProjection(startDate, "THREAD");
        
        Map<String, String> statusLabels = Map.of(
            "1", "Chờ xử lý",
            "2", "Đang xử lý",
            "3", "Đã giải quyết",
            "4", "Bỏ qua"
        );

        AdminStatsResponse response = buildResponse(data, startDate, clampedMonths, statusLabels, false);
        
        // Build reason/type distribution
        Map<String, Long> reasonCounts = new HashMap<>();
        
        for (Object[] row : data) {
            if (row == null) continue;
            String reason = (String) row[2];
            String reasonKey = (reason == null || reason.isEmpty()) ? "Khác" : reason;
            reasonCounts.merge(reasonKey, 1L, Long::sum);
        }
        
        response.setTypeDistribution(toKeyCountList(reasonCounts, null));
        
        return response;
    }

    private int clampMonths(int months) {
        if (months < 1) return 1;
        if (months > 120) return 120;
        return months;
    }

    private AdminStatsResponse buildResponse(List<Object[]> data, LocalDateTime startDate, int months, Map<String, String> statusLabels, boolean hasAmount) {
        List<String> monthKeys = generateMonthKeys(startDate, months);
        
        Map<String, TrendPointDTO> trendMap = new LinkedHashMap<>();
        for (String mk : monthKeys) {
            trendMap.put(mk, TrendPointDTO.builder()
                .month(mk)
                .total(0)
                .amount(0.0)
                .statusCounts(new HashMap<>())
                .build());
        }
        
        Map<String, Long> globalStatusCounts = new HashMap<>();
        long totalRecords = 0;
        double totalAmount = 0.0;
        
        for (Object[] row : data) {
            if (row == null || row[0] == null) continue;
            
            LocalDateTime createdAt = (LocalDateTime) row[0];
            String monthKey = createdAt.format(MONTH_FORMATTER);
            
            Integer statusObj = (Integer) row[1];
            String status = statusObj != null ? String.valueOf(statusObj) : "0";
            String statusLabel = statusLabels.getOrDefault(status, "Khác");
            
            double amount = 0.0;
            if (hasAmount && row.length > 2 && row[2] != null) {
                if (row[2] instanceof BigDecimal) {
                    amount = ((BigDecimal) row[2]).doubleValue();
                } else if (row[2] instanceof Double) {
                    amount = (Double) row[2];
                } else if (row[2] instanceof Integer) {
                    amount = ((Integer) row[2]).doubleValue();
                }
            }
            
            TrendPointDTO point = trendMap.get(monthKey);
            if (point != null) {
                point.setTotal(point.getTotal() + 1);
                point.setAmount(point.getAmount() + amount);
                point.getStatusCounts().merge(statusLabel, 1L, Long::sum);
            }
            
            globalStatusCounts.merge(statusLabel, 1L, Long::sum);
            totalRecords++;
            totalAmount += amount;
        }
        
        // Ensure all status labels exist in trend points even if 0
        for (TrendPointDTO point : trendMap.values()) {
            for (String label : statusLabels.values()) {
                point.getStatusCounts().putIfAbsent(label, 0L);
            }
        }
        
        List<KeyCountDTO> statusDistribution = new ArrayList<>();
        for (Map.Entry<String, String> entry : statusLabels.entrySet()) {
            String label = entry.getValue();
            long count = globalStatusCounts.getOrDefault(label, 0L);
            statusDistribution.add(KeyCountDTO.builder()
                .key(entry.getKey())
                .label(label)
                .count(count)
                .build());
        }
        
        return AdminStatsResponse.builder()
            .trends(new ArrayList<>(trendMap.values()))
            .statusDistribution(statusDistribution)
            .totalRecords(totalRecords)
            .totalAmount(totalAmount)
            .build();
    }

    private List<String> generateMonthKeys(LocalDateTime startDate, int months) {
        List<String> keys = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            keys.add(startDate.plusMonths(i).format(MONTH_FORMATTER));
        }
        return keys;
    }
    
    private List<KeyCountDTO> toKeyCountList(Map<String, Long> counts, Map<String, String> labels) {
        return counts.entrySet().stream()
            .map(e -> KeyCountDTO.builder()
                .key(e.getKey())
                .label(labels != null ? labels.getOrDefault(e.getKey(), e.getKey()) : e.getKey())
                .count(e.getValue())
                .build())
            .sorted((a, b) -> Long.compare(b.getCount(), a.getCount())) // sort desc by count
            .collect(Collectors.toList());
    }
}
