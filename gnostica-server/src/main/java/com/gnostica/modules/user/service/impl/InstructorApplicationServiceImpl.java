package com.gnostica.modules.user.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Role;
import com.gnostica.modules.user.dto.request.InstructorApplicationRequest;
import com.gnostica.modules.user.dto.request.RejectApplicationRequest;
import com.gnostica.modules.user.dto.response.InstructorApplicationResponse;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.RoleRepository;
import com.gnostica.modules.user.service.InstructorApplicationService;
import com.gnostica.modules.integration.service.MailService;
import com.gnostica.modules.integration.service.FptOcrService;
import com.gnostica.modules.user.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InstructorApplicationServiceImpl implements InstructorApplicationService {

    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final MailService mailService;
    private final NotificationService notificationService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final FptOcrService fptOcrService;

    @Override
    public void submitApplication(String email, InstructorApplicationRequest request) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // 0. Validate phone number uniqueness
            String inputPhone = request.getContactPhone();
            if (inputPhone != null && !inputPhone.isEmpty()) {
                String normalizedInput = normalizePhone(inputPhone);
                String altFormat = inputPhone.startsWith("+84") ? "0" + inputPhone.substring(3) : "+84" + inputPhone.substring(1);

                // Check standard phone field in db
                java.util.Optional<Account> existingByPhone = accountRepository.findByPhone(inputPhone);
                java.util.Optional<Account> existingByPhoneAlt = accountRepository.findByPhone(altFormat);

                if ((existingByPhone.isPresent() && !existingByPhone.get().getId().equals(account.getId())) ||
                    (existingByPhoneAlt.isPresent() && !existingByPhoneAlt.get().getId().equals(account.getId()))) {
                    throw new RuntimeException("Số điện thoại này đã được sử dụng bởi một tài khoản khác.");
                }

                // Check metadata of other applicants
                List<Account> accountsWithMetadata = accountRepository.findByMetadataIsNotNull();
                for (Account acc : accountsWithMetadata) {
                    if (acc.getId().equals(account.getId())) {
                        continue;
                    }
                    try {
                        JsonNode accRootNode = objectMapper.readTree(acc.getMetadata());
                        if (accRootNode.has("instructorApplication")) {
                            JsonNode accAppNode = accRootNode.get("instructorApplication");
                            String status = accAppNode.path("status").asText("");
                            String contactPhone = accAppNode.path("contactPhone").asText("");
                            if (("PENDING".equals(status) || "APPROVED".equals(status)) && !contactPhone.isEmpty()) {
                                String normalizedContactPhone = normalizePhone(contactPhone);
                                if (normalizedInput.equals(normalizedContactPhone)) {
                                    throw new RuntimeException("Số điện thoại này đã được đăng ký cho một hồ sơ giảng viên khác.");
                                }
                            }
                        }
                    } catch (Exception ignored) {
                    }
                }
            }

            ObjectNode rootNode;
            if (account.getMetadata() == null || account.getMetadata().isEmpty()) {
                rootNode = objectMapper.createObjectNode();
            } else {
                rootNode = (ObjectNode) objectMapper.readTree(account.getMetadata());
            }

            if (rootNode.has("instructorApplication")) {
                JsonNode appNode = rootNode.get("instructorApplication");
                if (appNode.has("status")) {
                    String status = appNode.get("status").asText();
                    if ("PENDING".equals(status)) {
                        throw new RuntimeException("Bạn đã gửi yêu cầu xét duyệt rồi.");
                    } else if ("APPROVED".equals(status)) {
                        throw new RuntimeException("Bạn đã là giảng viên.");
                    }
                }
            }

            // 1. Call FPT.AI OCR to verify the front ID card
            String ocrJsonResult = fptOcrService.extractIdCardInfo(request.getIdCardFront());
            JsonNode ocrResult = objectMapper.readTree(ocrJsonResult);
            if (ocrResult.path("errorCode").asInt() != 0) {
                throw new RuntimeException("Không thể nhận diện được hình ảnh CCCD. Vui lòng chụp/tải ảnh rõ nét hơn.");
            }

            JsonNode dataNode = ocrResult.path("data").get(0);
            if (dataNode == null) {
                throw new RuntimeException("Không tìm thấy dữ liệu trên CCCD.");
            }

            String ocrName = dataNode.path("name").asText("").trim();
            double nameProbability = dataNode.path("name_prob").asDouble(0.0);

            // Verify accuracy score (> 85%)
            if (nameProbability < 0.85) {
                throw new RuntimeException("Ảnh chụp CCCD không đủ rõ nét (độ chính xác thấp). Vui lòng chụp lại ảnh rõ hơn.");
            }

            // Normalize and compare name (without accent marks)
            String accountNameNormalized = removeAccent(account.getFullName().toLowerCase().trim());
            String ocrNameNormalized = removeAccent(ocrName.toLowerCase().trim());

            if (!accountNameNormalized.equals(ocrNameNormalized)) {
                throw new RuntimeException("Họ tên trên CCCD (" + ocrName + ") không trùng khớp với họ tên đăng ký tài khoản (" + account.getFullName() + ").");
            }

            // 2. Save the application with PENDING status for admin review
            ObjectNode appNode = rootNode.putObject("instructorApplication");
            appNode.put("idCardFront", request.getIdCardFront());
            appNode.put("idCardBack", request.getIdCardBack());
            appNode.put("contactPhone", request.getContactPhone());
            appNode.put("cvUrl", request.getCvUrl());
            appNode.put("degreeUrls", request.getDegreeUrls());
            appNode.put("certificateUrls", request.getCertificateUrls());
            appNode.put("sampleVideoUrl", request.getSampleVideoUrl());
            appNode.put("courseOutline", request.getCourseOutline());
            appNode.put("status", "PENDING"); // Save as PENDING so it appears in admin queue
            appNode.put("createdAt", java.time.LocalDateTime.now().toString());

            account.setMetadata(objectMapper.writeValueAsString(rootNode));
            accountRepository.save(account);


        } catch (Exception e) {
            if (e instanceof RuntimeException) throw (RuntimeException) e;
            throw new RuntimeException("Lỗi xử lý duyệt tự động CCCD: " + e.getMessage(), e);
        }
    }

    @Override
    public List<InstructorApplicationResponse> getAllApplications() {
        List<InstructorApplicationResponse> responses = new ArrayList<>();
        List<Account> accounts = accountRepository.findByMetadataIsNotNull();
        for (Account account : accounts) {
            InstructorApplicationResponse response = extractApplicationFromAccount(account);
            if (response != null) {
                responses.add(response);
            }
        }
        return responses;
    }

    @Override
    public List<InstructorApplicationResponse> getPendingApplications() {
        List<InstructorApplicationResponse> responses = new ArrayList<>();
        List<Account> accounts = accountRepository.findByMetadataIsNotNull();
        for (Account account : accounts) {
            InstructorApplicationResponse response = extractApplicationFromAccount(account);
            if (response != null && "PENDING".equals(response.getStatus())) {
                responses.add(response);
            }
        }
        return responses;
    }

    @Override
    public void approveApplication(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        try {
            if (account.getMetadata() == null || account.getMetadata().isEmpty()) {
                throw new RuntimeException("Application not found in metadata");
            }

            ObjectNode rootNode = (ObjectNode) objectMapper.readTree(account.getMetadata());
            if (!rootNode.has("instructorApplication")) {
                throw new RuntimeException("Application not found in metadata");
            }

            ObjectNode appNode = (ObjectNode) rootNode.get("instructorApplication");
            if (!"PENDING".equals(appNode.path("status").asText())) {
                throw new RuntimeException("Only pending applications can be approved");
            }

            appNode.put("status", "APPROVED");

            // Update user role
            Role role = roleRepository.findByName("INSTRUCTOR")
                    .orElseThrow(() -> new RuntimeException("Role INSTRUCTOR not found"));
            account.setRole(role);

            // Update phone if empty
            if (account.getPhone() == null || account.getPhone().isEmpty()) {
                account.setPhone(appNode.path("contactPhone").asText(""));
            }

            // Update metadata additional fields
            rootNode.put("ticked", false);
            rootNode.put("bio", "");

            account.setMetadata(objectMapper.writeValueAsString(rootNode));
            accountRepository.save(account);

            try {
                mailService.sendEmail(account.getEmail(), "Đơn đăng ký giảng viên được chấp thuận",
                        "Chúc mừng! Đơn đăng ký giảng viên của bạn đã được chấp thuận. Bạn có thể bắt đầu tạo khóa học ngay bây giờ.");
            } catch (Exception e) {
                System.err.println("Failed to send approval email to " + account.getEmail() + ": " + e.getMessage());
            }
            notificationService.createNotification(account, "Đơn đăng ký được phê duyệt",
                    "Chúc mừng! Đơn đăng ký giảng viên của bạn đã được chấp thuận.", "SYSTEM");

        } catch (Exception e) {
            if (e instanceof RuntimeException) throw (RuntimeException) e;
            throw new RuntimeException("Error approving application", e);
        }
    }

    @Override
    public void rejectApplication(UUID accountId, RejectApplicationRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        try {
            if (account.getMetadata() == null || account.getMetadata().isEmpty()) {
                throw new RuntimeException("Application not found in metadata");
            }

            ObjectNode rootNode = (ObjectNode) objectMapper.readTree(account.getMetadata());
            if (!rootNode.has("instructorApplication")) {
                throw new RuntimeException("Application not found in metadata");
            }

            ObjectNode appNode = (ObjectNode) rootNode.get("instructorApplication");
            if (!"PENDING".equals(appNode.path("status").asText())) {
                throw new RuntimeException("Only pending applications can be rejected");
            }

            appNode.put("status", "REJECTED");
            appNode.put("rejectionReason", request.getReason());

            account.setMetadata(objectMapper.writeValueAsString(rootNode));
            accountRepository.save(account);

            try {
                mailService.sendEmail(account.getEmail(), "Thông báo về đơn đăng ký giảng viên",
                        "Rất tiếc, đơn đăng ký làm giảng viên của bạn đã bị từ chối.<br/><strong>Lý do:</strong> "
                                + request.getReason());
            } catch (Exception e) {
                System.err.println("Failed to send rejection email to " + account.getEmail() + ": " + e.getMessage());
            }
            notificationService.createNotification(account, "Đơn đăng ký bị từ chối",
                    "Rất tiếc, đơn đăng ký làm giảng viên của bạn đã bị từ chối. Lý do: " + request.getReason(),
                    "SYSTEM");

        } catch (Exception e) {
            if (e instanceof RuntimeException) throw (RuntimeException) e;
            throw new RuntimeException("Error rejecting application", e);
        }
    }

    private InstructorApplicationResponse extractApplicationFromAccount(Account account) {
        try {
            if (account.getMetadata() == null || account.getMetadata().isEmpty()) return null;
            JsonNode rootNode = objectMapper.readTree(account.getMetadata());
            if (!rootNode.has("instructorApplication")) return null;

            JsonNode appNode = rootNode.get("instructorApplication");
            InstructorApplicationResponse response = new InstructorApplicationResponse();
            response.setAccountId(account.getId());
            response.setEmail(account.getEmail());
            response.setFullName(account.getFullName());
            
            response.setIdCardFront(appNode.path("idCardFront").asText(null));
            response.setIdCardBack(appNode.path("idCardBack").asText(null));
            response.setContactPhone(appNode.path("contactPhone").asText(null));
            response.setCvUrl(appNode.path("cvUrl").asText(null));
            response.setDegreeUrls(appNode.path("degreeUrls").asText(null));
            response.setCertificateUrls(appNode.path("certificateUrls").asText(null));
            response.setSampleVideoUrl(appNode.path("sampleVideoUrl").asText(null));
            response.setCourseOutline(appNode.path("courseOutline").asText(null));
            response.setStatus(appNode.path("status").asText(null));
            response.setRejectionReason(appNode.path("rejectionReason").asText(null));
            response.setCreatedAt(appNode.path("createdAt").asText(null));
            
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private String removeAccent(String s) {
        if (s == null) return "";
        String temp = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").replace('đ', 'd').replace('Đ', 'D');
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        String normalized = phone.trim().replaceAll("\\s+", "");
        if (normalized.startsWith("+84")) {
            normalized = "0" + normalized.substring(3);
        }
        return normalized;
    }
}
