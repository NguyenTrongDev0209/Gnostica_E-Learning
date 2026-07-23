package com.gnostica.modules.course.controller;

import com.gnostica.modules.course.dto.response.CertificateDTO;
import com.gnostica.core.model.Enrollment;
import com.gnostica.core.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CertificateController {

    private final EnrollmentRepository enrollmentRepository;
    private final com.gnostica.core.repository.AccountRepository accountRepository;

    @GetMapping("/my-certificates")
    public ResponseEntity<java.util.List<CertificateDTO>> getMyCertificates(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return accountRepository.findByEmail(authentication.getName())
                .map(account -> {
                    java.util.List<CertificateDTO> dtos = enrollmentRepository.findByAccountAndCertificateUrlIsNotNull(account).stream()
                            .map(enrollment -> CertificateDTO.builder()
                                    .certificateUrl(enrollment.getCertificateUrl())
                                    .courseTitle(enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : "Unknown Course")
                                    .studentName(enrollment.getAccount() != null ? enrollment.getAccount().getFullName() : "Unknown Student")
                                    .instructorName(enrollment.getCourse() != null && enrollment.getCourse().getAccount() != null 
                                            ? enrollment.getCourse().getAccount().getFullName() : "Unknown Instructor")
                                    .completedAt(enrollment.getCompletedAt())
                                    .build())
                            .collect(java.util.stream.Collectors.toList());
                    return ResponseEntity.ok(dtos);
                })
                .orElseGet(() -> ResponseEntity.status(404).build());
    }

    @GetMapping("/{certificateUrl}")
    public ResponseEntity<CertificateDTO> getCertificate(@PathVariable String certificateUrl) {
        return enrollmentRepository.findByCertificateUrl(certificateUrl)
                .map(enrollment -> {
                    CertificateDTO dto = CertificateDTO.builder()
                            .certificateUrl(enrollment.getCertificateUrl())
                            .courseTitle(enrollment.getCourse() != null ? enrollment.getCourse().getTitle() : "Unknown Course")
                            .studentName(enrollment.getAccount() != null ? enrollment.getAccount().getFullName() : "Unknown Student")
                            .instructorName(enrollment.getCourse() != null && enrollment.getCourse().getAccount() != null 
                                    ? enrollment.getCourse().getAccount().getFullName() : "Unknown Instructor")
                            .completedAt(enrollment.getCompletedAt())
                            .build();
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
