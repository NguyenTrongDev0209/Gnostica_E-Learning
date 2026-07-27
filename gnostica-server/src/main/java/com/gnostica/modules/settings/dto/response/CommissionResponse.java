package com.gnostica.modules.settings.dto.response;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.model.Commission;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CommissionResponse {
    private Integer id;
    private BigDecimal platformRatio;
    private BigDecimal instructorRatio;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Integer status;
    private String noticeFileUrl;
    private Boolean notified;
    private Boolean editable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommissionResponse from(Commission commission, ObjectMapper mapper) {
        String noticeFileUrl = null;
        Boolean notified = false;
        
        try {
            if (commission.getMetadata() != null && !commission.getMetadata().isEmpty() && !commission.getMetadata().equals("{}")) {
                JsonNode metadataNode = mapper.readTree(commission.getMetadata());
                if (metadataNode.has("noticeFileUrl") && !metadataNode.get("noticeFileUrl").isNull()) {
                    noticeFileUrl = metadataNode.get("noticeFileUrl").asText();
                }
                if (metadataNode.has("notified") && !metadataNode.get("notified").isNull()) {
                    notified = metadataNode.get("notified").asBoolean();
                }
            }
        } catch (JsonProcessingException e) {
            // Log if needed, or ignore
        }

        boolean isEditable = commission.getValidFrom() != null && commission.getValidFrom().isAfter(LocalDateTime.now());

        return CommissionResponse.builder()
                .id(commission.getId())
                .platformRatio(commission.getPlatformRatio())
                .instructorRatio(commission.getInstructorRatio())
                .validFrom(commission.getValidFrom())
                .validUntil(commission.getValidUntil())
                .status(commission.getStatus())
                .noticeFileUrl(noticeFileUrl)
                .notified(notified)
                .editable(isEditable)
                .createdAt(commission.getCreatedAt())
                .updatedAt(commission.getUpdatedAt())
                .build();
    }
}
