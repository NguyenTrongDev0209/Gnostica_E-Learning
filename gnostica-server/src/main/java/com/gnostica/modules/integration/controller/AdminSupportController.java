package com.gnostica.modules.integration.controller;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.core.model.Support;
import com.gnostica.core.repository.SupportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * API để Admin quản lý các yêu cầu hỗ trợ được gửi từ Chatbox AI.
 */
@RestController
@RequestMapping("/api/admin/supports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
public class AdminSupportController {

    private final SupportRepository supportRepository;

    /**
     * Lấy tất cả ticket hỗ trợ, sắp xếp mới nhất trước.
     */
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getAllTickets() {
        List<Support> tickets = supportRepository.findAll(
            org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "createdAt"
            )
        );
        List<Map<String, Object>> result = tickets.stream().map(this::toDto).toList();
        return ApiResponse.success(result);
    }

    /**
     * Cập nhật trạng thái ticket hỗ trợ.
     * Status: 0: Open, 1: In Progress, 3: Resolved, 4: Closed
     */
    @PutMapping("/{id}/status")
    public ApiResponse<Map<String, Object>> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Support ticket = supportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ticket #" + id));
        ticket.setStatus(body.get("status"));
        supportRepository.save(ticket);
        log.info("AdminSupportController: Ticket #{} status -> {}", id, body.get("status"));
        return ApiResponse.success("Đã cập nhật trạng thái ticket", toDto(ticket));
    }

    /**
     * Cập nhật mức độ ưu tiên ticket hỗ trợ.
     * Priority: 1: Thấp, 2: Trung bình, 3: Cao
     */
    @PutMapping("/{id}/priority")
    public ApiResponse<Map<String, Object>> updatePriority(
            @PathVariable Integer id,
            @RequestBody Map<String, Integer> body) {
        Support ticket = supportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ticket #" + id));
        Integer priority = body.get("priority");
        if (priority == null || priority < 1 || priority > 3) {
            throw new IllegalArgumentException("Mức ưu tiên không hợp lệ. Giá trị hợp lệ: 1 (Thấp), 2 (Trung bình), 3 (Cao).");
        }
        ticket.setPriority(priority);
        supportRepository.save(ticket);
        log.info("AdminSupportController: Ticket #{} priority -> {}", id, priority);
        return ApiResponse.success("Đã cập nhật mức độ ưu tiên ticket", toDto(ticket));
    }

    // -------- DTO mapper --------
    private Map<String, Object> toDto(Support s) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", s.getId());
        dto.put("subject", s.getSubject());
        dto.put("content", s.getContent());
        dto.put("type", s.getType());
        dto.put("priority", s.getPriority());
        dto.put("status", s.getStatus());
        dto.put("metadata", s.getMetadata());
        dto.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : null);
        dto.put("updatedAt", s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : null);

        if (s.getAccount() != null) {
            Map<String, Object> acc = new HashMap<>();
            acc.put("id", s.getAccount().getId());
            acc.put("fullName", s.getAccount().getFullName());
            acc.put("email", s.getAccount().getEmail());
            dto.put("account", acc);
        }

        if (s.getAssignee() != null) {
            Map<String, Object> asgn = new HashMap<>();
            asgn.put("id", s.getAssignee().getId());
            asgn.put("fullName", s.getAssignee().getFullName());
            dto.put("assignee", asgn);
        }

        return dto;
    }
}
