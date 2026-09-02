package com.gnostica.modules.settings.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Commission;
import com.gnostica.core.repository.CommissionRepository;
import com.gnostica.modules.integration.service.CloudinaryService;
import com.gnostica.modules.settings.dto.request.CreateCommissionRequest;
import com.gnostica.modules.settings.dto.response.CommissionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommissionService {

    private final CommissionRepository commissionRepository;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper;
    private final com.gnostica.core.repository.AccountRepository accountRepository;
    private final com.gnostica.modules.integration.service.MailService mailService;
    private final com.gnostica.modules.user.service.NotificationService notificationService;

    private Commission lazilyUpdateStatus(Commission c, LocalDateTime now) {
        int calculatedStatus = 0; // Draft
        if (c.getValidFrom() != null && !c.getValidFrom().isAfter(now)) {
            if (c.getValidUntil() == null || c.getValidUntil().isAfter(now)) {
                calculatedStatus = 1; // Active
            } else {
                calculatedStatus = 2; // Expired
            }
        }
        if (c.getStatus() == null || c.getStatus() != calculatedStatus) {
            c.setStatus(calculatedStatus);
            return commissionRepository.save(c);
        }
        return c;
    }

    @Transactional
    public List<CommissionResponse> getGlobalCommissions() {
        LocalDateTime now = LocalDateTime.now();
        return commissionRepository.findAllByOrderByValidFromDesc()
                .stream()
                .filter(c -> c.getAccount() == null || isGlobalCreator(c.getAccount()))
                .map(c -> lazilyUpdateStatus(c, now))
                .map(c -> CommissionResponse.from(c, objectMapper))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommissionResponse getActiveGlobalCommission() {
        LocalDateTime now = LocalDateTime.now();
        return commissionRepository.findActiveGlobalCommissionAt(now)
                .map(c -> lazilyUpdateStatus(c, now))
                .map(c -> CommissionResponse.from(c, objectMapper))
                .orElse(null);
    }

    @Transactional
    public CommissionResponse createCommission(CreateCommissionRequest request, MultipartFile file, String adminEmail) throws Exception {
        Account admin = accountRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản admin"));
        
        if (!"ADMIN".equalsIgnoreCase(admin.getRole().getName())) {
            throw new IllegalStateException("Bạn không có quyền thực hiện hành động này");
        }

        if (request.getPlatformRatio().add(request.getInstructorRatio()).compareTo(new BigDecimal("100")) != 0) {
            throw new IllegalArgumentException("Tổng tỷ lệ hoa hồng phải bằng 100%");
        }

        String noticeFileUrl = null;
        if (file != null && !file.isEmpty()) {
            noticeFileUrl = cloudinaryService.uploadDocument(file);
        }

        if (request.getApplyAfterDays() == null || request.getApplyAfterDays() < 7) {
            throw new IllegalArgumentException("Thời gian áp dụng phải từ sau 7 ngày trở lên tính từ hôm nay.");
        }

        LocalDateTime validFrom = LocalDate.now().plusDays(request.getApplyAfterDays() + 1).atStartOfDay();

        if (commissionRepository.existsGlobalByValidFrom(validFrom)) {
            throw new IllegalArgumentException("Đã tồn tại một Quyết định áp dụng vào thời gian này. Vui lòng chọn thời gian khác.");
        }

        Commission activeGlobal = commissionRepository.findAllByOrderByValidFromDesc().stream()
                .filter(c -> c.getAccount() == null || isGlobalCreator(c.getAccount()))
                .findFirst()
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        
        if (activeGlobal != null) {
            activeGlobal.setValidUntil(validFrom.minusMinutes(1));
            lazilyUpdateStatus(activeGlobal, now);
            commissionRepository.save(activeGlobal);
        }

        ObjectNode metadata = objectMapper.createObjectNode();
        if (noticeFileUrl != null) {
            metadata.put("noticeFileUrl", noticeFileUrl);
        }
        metadata.put("notified", false);

        int initialStatus = validFrom.isAfter(now) ? 0 : 1;
        Commission newCommission = Commission.builder()
                .account(admin)
                .platformRatio(request.getPlatformRatio())
                .instructorRatio(request.getInstructorRatio())
                .validFrom(validFrom)
                .status(initialStatus)
                .metadata(metadata.toString())
                .build();

        newCommission = commissionRepository.save(newCommission);

        return CommissionResponse.from(newCommission, objectMapper);
    }

    @Transactional
    public CommissionResponse updateCommission(Integer id, CreateCommissionRequest request, MultipartFile file) throws Exception {
        if (request.getPlatformRatio().add(request.getInstructorRatio()).compareTo(new BigDecimal("100")) != 0) {
            throw new IllegalArgumentException("Tổng tỷ lệ hoa hồng phải bằng 100%");
        }

        Commission commission = commissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quyết định"));

        boolean isEditable = commission.getValidFrom() != null && commission.getValidFrom().isAfter(LocalDateTime.now());
        if (!isEditable) {
            throw new IllegalStateException("Không thể chỉnh sửa quyết định đã áp dụng hoặc trong quá khứ");
        }

        if (file != null && !file.isEmpty()) {
            String noticeFileUrl = cloudinaryService.uploadDocument(file);
            ObjectNode metadata = commission.getMetadata() != null && !commission.getMetadata().isEmpty()
                    ? (ObjectNode) objectMapper.readTree(commission.getMetadata())
                    : objectMapper.createObjectNode();
            metadata.put("noticeFileUrl", noticeFileUrl);
            metadata.put("notified", false);
            commission.setMetadata(metadata.toString());
        }

        if (request.getApplyAfterDays() == null || request.getApplyAfterDays() < 7) {
            throw new IllegalArgumentException("Thời gian áp dụng phải từ sau 7 ngày trở lên tính từ hôm nay.");
        }

        LocalDateTime validFrom = LocalDate.now().plusDays(request.getApplyAfterDays() + 1).atStartOfDay();

        if (commissionRepository.existsGlobalByValidFromAndIdNot(validFrom, commission.getId())) {
            throw new IllegalArgumentException("Đã tồn tại một Quyết định khác áp dụng vào thời gian này. Vui lòng chọn thời gian khác.");
        }

        commission.setPlatformRatio(request.getPlatformRatio());
        commission.setInstructorRatio(request.getInstructorRatio());
        commission.setValidFrom(validFrom);

        Integer commissionId = commission.getId();
        Commission previousGlobal = commissionRepository.findAllByOrderByValidFromDesc()
                .stream()
                .filter(item -> (item.getAccount() == null || isGlobalCreator(item.getAccount())) && !item.getId().equals(commissionId))
                .findFirst()
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        if (previousGlobal != null) {
            previousGlobal.setValidUntil(validFrom.minusMinutes(1));
            lazilyUpdateStatus(previousGlobal, now);
            commissionRepository.save(previousGlobal);
        }

        lazilyUpdateStatus(commission, now);

        commission = commissionRepository.save(commission);
        return CommissionResponse.from(commission, objectMapper);
    }

    @Transactional
    public CommissionResponse notifyCommission(Integer id) throws Exception {
        Commission commission = commissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quyết định"));

        ObjectNode metadata = commission.getMetadata() != null && !commission.getMetadata().isEmpty()
                ? (ObjectNode) objectMapper.readTree(commission.getMetadata())
                : objectMapper.createObjectNode();

        if (metadata.path("notified").asBoolean(false)) {
            throw new IllegalStateException("Quyết định này đã được thông báo trước đó");
        }

        String noticeFileUrl = metadata.path("noticeFileUrl").asText(null);
        String applyDate = commission.getValidFrom() != null
                ? commission.getValidFrom().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                : "Ngay khi quyết định được duyệt";

        List<Account> instructors = accountRepository.findByRoleName("INSTRUCTOR");
        for (Account instructor : instructors) {
            mailService.sendCommissionNoticeEmail(
                    instructor.getEmail(),
                    instructor.getFullName(),
                    applyDate,
                    commission.getPlatformRatio(),
                    commission.getInstructorRatio(),
                    noticeFileUrl
            );
            if (notificationService != null) {
                notificationService.createNotification(
                        instructor,
                        "Thông báo điều chỉnh tỷ lệ hoa hồng",
                        "Tỷ lệ hoa hồng mới (" + commission.getPlatformRatio() + "% nền tảng, " + commission.getInstructorRatio() + "% giảng viên) sẽ chính thức có hiệu lực từ ngày " + applyDate + ".",
                        "COMMISSION_NOTICE",
                        commission.getId().toString()
                );
            }
        }

        metadata.put("notified", true);
        commission.setMetadata(metadata.toString());
        commission = commissionRepository.save(commission);
        return CommissionResponse.from(commission, objectMapper);
    }

    private boolean isGlobalCreator(Account account) {
        return account.getRole() != null && ("ADMIN".equals(account.getRole().getName()) || "ROLE_ADMIN".equals(account.getRole().getName()));
    }
}
