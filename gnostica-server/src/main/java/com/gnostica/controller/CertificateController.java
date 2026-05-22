package com.gnostica.controller;

import com.gnostica.dto.response.CertificateDTO;
import com.gnostica.model.Enrollment;
import com.gnostica.repository.EnrollmentRepository;
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

    @GetMapping("/{certifiUrl}")
    public ResponseEntity<CertificateDTO> getCertificate(@PathVariable String certifiUrl) {
        return enrollmentRepository.findByCertifiUrl(certifiUrl)
                .map(enrollment -> {
                    CertificateDTO dto = CertificateDTO.builder()
                            .certifiUrl(enrollment.getCertifiUrl())
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
