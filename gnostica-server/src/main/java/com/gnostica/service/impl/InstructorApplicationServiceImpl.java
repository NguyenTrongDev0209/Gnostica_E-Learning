package com.gnostica.service.impl;

import com.gnostica.model.Account;
import com.gnostica.model.InstructorApplication;
import com.gnostica.model.Role;
import com.gnostica.payload.request.InstructorApplicationRequest;
import com.gnostica.payload.request.RejectApplicationRequest;
import com.gnostica.payload.response.InstructorApplicationResponse;
import com.gnostica.model.Instructor;
import com.gnostica.repository.AccountRepository;
import com.gnostica.repository.InstructorApplicationRepository;
import com.gnostica.repository.InstructorRepository;
import com.gnostica.repository.RoleRepository;
import com.gnostica.service.InstructorApplicationService;
import com.gnostica.service.MailService;
import com.gnostica.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InstructorApplicationServiceImpl implements InstructorApplicationService {

    private final InstructorApplicationRepository applicationRepository;
    private final AccountRepository accountRepository;
    private final InstructorRepository instructorRepository;
    private final RoleRepository roleRepository;
    private final MailService mailService;
    private final NotificationService notificationService;

    @Override
    public void submitApplication(String email, InstructorApplicationRequest request) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if there is already a pending or approved application
        applicationRepository.findByAccount_Id(account.getId()).ifPresent(app -> {
            if ("PENDING".equals(app.getStatus())) {
                throw new RuntimeException("Bạn đã gửi yêu cầu xét duyệt rồi.");
            } else if ("APPROVED".equals(app.getStatus())) {
                throw new RuntimeException("You are already an approved instructor.");
            }
        });

        InstructorApplication application = new InstructorApplication();
        application.setAccount(account);
        application.setIdCardFront(request.getIdCardFront());
        application.setIdCardBack(request.getIdCardBack());
        application.setContactPhone(request.getContactPhone());
        application.setCvUrl(request.getCvUrl());
        application.setDegreeUrls(request.getDegreeUrls());
        application.setSampleVideoUrl(request.getSampleVideoUrl());
        application.setCourseOutline(request.getCourseOutline());
        application.setStatus("PENDING");

        applicationRepository.save(application);
    }

    @Override
    public List<InstructorApplicationResponse> getAllApplications() {
        return applicationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InstructorApplicationResponse> getPendingApplications() {
        return applicationRepository.findByStatus("PENDING").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void approveApplication(Integer id) {
        InstructorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"PENDING".equals(application.getStatus())) {
            throw new RuntimeException("Only pending applications can be approved");
        }

        application.setStatus("APPROVED");
        applicationRepository.save(application);

        // Change user role
        Account account = application.getAccount();
        Role role = roleRepository.findByName("INSTRUCTOR")
                .orElseThrow(() -> new RuntimeException("Role INSTRUCTOR not found"));
        account.setRole(role);
        accountRepository.save(account);

        // Create or Update Instructor record
        Instructor instructor = instructorRepository.findByAccountId(account.getId())
                .orElse(new Instructor());
        
        instructor.setAccount(account);
        instructor.setFullName(account.getFullName());
        instructor.setEmail(account.getEmail());
        instructor.setPhone(application.getContactPhone());
        instructor.setStatus(1); // Active
        instructor.setCreatedAt(LocalDateTime.now());
        instructor.setTicked(false);
        // Bio can be default or empty for now, or extracted from somewhere if available
        
        instructorRepository.save(instructor);

        try {
            mailService.sendEmail(account.getEmail(), "Đơn đăng ký giảng viên được chấp thuận",
                    "Chúc mừng! Đơn đăng ký giảng viên của bạn đã được chấp thuận. Bạn có thể bắt đầu tạo khóa học ngay bây giờ.");
            notificationService.createNotification(account, "Đơn đăng ký được phê duyệt", 
                    "Chúc mừng! Đơn đăng ký giảng viên của bạn đã được chấp thuận.", "SYSTEM");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void rejectApplication(Integer id, RejectApplicationRequest request) {
        InstructorApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!"PENDING".equals(application.getStatus())) {
            throw new RuntimeException("Only pending applications can be rejected");
        }

        application.setStatus("REJECTED");
        application.setRejectionReason(request.getReason());
        applicationRepository.save(application);

        try {
            mailService.sendEmail(application.getAccount().getEmail(), "Thông báo về đơn đăng ký giảng viên",
                    "Rất tiếc, đơn đăng ký làm giảng viên của bạn đã bị từ chối.<br/><strong>Lý do:</strong> " + request.getReason());
            notificationService.createNotification(application.getAccount(), "Đơn đăng ký bị từ chối", 
                    "Rất tiếc, đơn đăng ký làm giảng viên của bạn đã bị từ chối. Lý do: " + request.getReason(), "SYSTEM");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private InstructorApplicationResponse mapToResponse(InstructorApplication entity) {
        InstructorApplicationResponse response = new InstructorApplicationResponse();
        response.setId(entity.getId());
        response.setEmail(entity.getAccount().getEmail());
        response.setFullName(entity.getAccount().getFullName());
        response.setIdCardFront(entity.getIdCardFront());
        response.setIdCardBack(entity.getIdCardBack());
        response.setContactPhone(entity.getContactPhone());
        response.setCvUrl(entity.getCvUrl());
        response.setDegreeUrls(entity.getDegreeUrls());
        response.setSampleVideoUrl(entity.getSampleVideoUrl());
        response.setCourseOutline(entity.getCourseOutline());
        response.setStatus(entity.getStatus());
        response.setRejectionReason(entity.getRejectionReason());
        response.setCreatedAt(entity.getCreatedAt());
        return response;
    }
}
