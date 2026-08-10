package com.gnostica.modules.adminstats;

import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.core.repository.RefundRepository;
import com.gnostica.core.repository.ReportRepository;
import com.gnostica.core.repository.SupportRepository;
import com.gnostica.modules.adminstats.dto.AdminStatsResponse;
import com.gnostica.modules.adminstats.dto.KeyCountDTO;
import com.gnostica.modules.adminstats.dto.TrendPointDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminStatsServiceImplTest {

    @Mock
    private SupportRepository supportRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private PayoutRepository payoutRepository;

    @Mock
    private ReportRepository reportRepository;

    @InjectMocks
    private AdminStatsServiceImpl adminStatsService;

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy");

    @BeforeEach
    void setUp() {
    }

    @Test
    void testGetSupportsStats_EmptyData() {
        when(supportRepository.getAdminStatsProjection(any(LocalDateTime.class))).thenReturn(new ArrayList<>());

        AdminStatsResponse response = adminStatsService.getSupportsStats(3);

        assertNotNull(response);
        assertEquals(0, response.getTotalRecords());
        assertEquals(0.0, response.getTotalAmount());
        assertEquals(3, response.getTrends().size()); // Zero-filled months
        
        for (TrendPointDTO tp : response.getTrends()) {
            assertEquals(0, tp.getTotal());
            assertNotNull(tp.getStatusCounts());
            assertTrue(tp.getStatusCounts().containsKey("Mở")); // check label fallback
        }
    }

    @Test
    void testGetSupportsStats_WithDataAndNullRows() {
        LocalDateTime now = LocalDateTime.now();
        List<Object[]> mockData = new ArrayList<>();
        // Row 1: Valid
        mockData.add(new Object[]{now, 0, "Question", 1});
        // Row 2: Invalid/Null
        mockData.add(null);
        // Row 3: Missing fields
        mockData.add(new Object[]{now.minusMonths(1), null, null, null});

        when(supportRepository.getAdminStatsProjection(any(LocalDateTime.class))).thenReturn(mockData);

        AdminStatsResponse response = adminStatsService.getSupportsStats(2);

        assertNotNull(response);
        assertEquals(2, response.getTotalRecords());
        
        // Month generation
        String currentMonthKey = now.format(MONTH_FORMATTER);
        String lastMonthKey = now.minusMonths(1).format(MONTH_FORMATTER);
        
        TrendPointDTO currentMonthPoint = response.getTrends().stream().filter(t -> t.getMonth().equals(currentMonthKey)).findFirst().orElse(null);
        assertNotNull(currentMonthPoint);
        assertEquals(1, currentMonthPoint.getTotal());
        
        // Type distribution check (null type should become "Khác")
        KeyCountDTO diffType = response.getTypeDistribution().stream().filter(k -> k.getLabel().equals("Khác")).findFirst().orElse(null);
        assertNotNull(diffType);
        assertEquals(1, diffType.getCount());
    }

    @Test
    void testGetRefundsStats_SumAmount() {
        LocalDateTime now = LocalDateTime.now();
        List<Object[]> mockData = new ArrayList<>();
        mockData.add(new Object[]{now, 2, new BigDecimal("150.50")});
        mockData.add(new Object[]{now, 2, 50.5}); // Double
        mockData.add(new Object[]{now, 3, 100}); // Integer

        when(refundRepository.getAdminStatsProjection(any(LocalDateTime.class))).thenReturn(mockData);

        AdminStatsResponse response = adminStatsService.getRefundsStats(1);

        assertNotNull(response);
        assertEquals(3, response.getTotalRecords());
        assertEquals(301.0, response.getTotalAmount(), 0.001); // 150.5 + 50.5 + 100
    }

    @Test
    void testGetThreadReportsStats_StatusMapping() {
        LocalDateTime now = LocalDateTime.now();
        List<Object[]> mockData = new ArrayList<>();
        mockData.add(new Object[]{now, 1, "Spam"});
        mockData.add(new Object[]{now, 3, "Inappropriate"});

        when(reportRepository.getAdminStatsProjection(any(LocalDateTime.class), eq("THREAD"))).thenReturn(mockData);

        AdminStatsResponse response = adminStatsService.getThreadReportsStats(1);

        assertNotNull(response);
        assertEquals(2, response.getTotalRecords());
        
        KeyCountDTO pendingStatus = response.getStatusDistribution().stream().filter(k -> k.getLabel().equals("Chờ xử lý")).findFirst().orElse(null);
        assertNotNull(pendingStatus);
        assertEquals(1, pendingStatus.getCount());
        
        KeyCountDTO resolvedStatus = response.getStatusDistribution().stream().filter(k -> k.getLabel().equals("Đã giải quyết")).findFirst().orElse(null);
        assertNotNull(resolvedStatus);
        assertEquals(1, resolvedStatus.getCount());
    }
    
    @Test
    void testClampMonths() {
        when(supportRepository.getAdminStatsProjection(any(LocalDateTime.class))).thenReturn(new ArrayList<>());
        
        // Test negative/zero -> 1
        AdminStatsResponse r1 = adminStatsService.getSupportsStats(-5);
        assertEquals(1, r1.getTrends().size());
        
        // Test large -> 120
        AdminStatsResponse r2 = adminStatsService.getSupportsStats(150);
        assertEquals(120, r2.getTrends().size());
    }
}
