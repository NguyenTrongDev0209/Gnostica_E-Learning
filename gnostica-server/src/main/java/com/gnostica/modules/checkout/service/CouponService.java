package com.gnostica.modules.checkout.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnostica.core.constant.CouponStatus;
import com.gnostica.core.constant.CouponScope;
import com.gnostica.core.constant.CouponDiscountType;
import com.gnostica.core.event.LogEvent;
import com.gnostica.core.model.Account;
import com.gnostica.core.model.Category;
import com.gnostica.core.model.Coupon;
import com.gnostica.core.model.Course;
import com.gnostica.core.repository.AccountRepository;
import com.gnostica.core.repository.CategoryRepository;
import com.gnostica.core.repository.CouponRepository;
import com.gnostica.core.repository.CourseRepository;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.security.CouponCodeCipher;
import com.gnostica.core.util.AuthUtil;
import com.gnostica.modules.checkout.dto.request.CouponRequest;
import com.gnostica.modules.checkout.dto.request.CouponScopeMetadata;
import com.gnostica.modules.checkout.dto.response.CouponResponse;
import com.gnostica.modules.checkout.dto.response.CouponScopeOptionResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService implements ApplicationRunner {

    private final CouponRepository couponRepository;
    private final AccountRepository accountRepository;
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final CouponCodeCipher couponCodeCipher;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        String code = normalizeCode(request.getCode());
        if (couponRepository.existsByCodeHash(couponCodeCipher.hash(code))
                || couponRepository.existsByEncryptedCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        Account account = getCurrentAccount();
        Coupon coupon = new Coupon();
        applyRequest(coupon, request, code, account);
        coupon.setStatus(request.getStatus() == null ? CouponStatus.INACTIVE : request.getStatus());
        coupon.setAccount(account);

        Coupon savedCoupon = couponRepository.save(coupon);
        publishAuditLog("CREATE_COUPON", savedCoupon, account);
        return mapToResponse(savedCoupon);
    }

    /**
     * Kept for backward compatibility with the existing web client. Results are
     * intentionally restricted to the authenticated account.
     */
    @Transactional(readOnly = true)
    public List<CouponResponse> getAllCoupons() {
        return getMyCoupons();
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getMyCoupons() {
        return couponRepository.findAllByAccountAndDeletedAtIsNullOrderByCreatedAtDesc(getCurrentAccount()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CouponResponse> getAdminCoupons(String ownerType) {
        Account currentAccount = getCurrentAccount();
        if (!isAdmin(currentAccount)) {
            throw new AccessDeniedException("Only administrators can view platform coupon management");
        }
        if (!"PLATFORM".equals(ownerType) && !"INSTRUCTOR".equals(ownerType)) {
            throw new IllegalArgumentException("Coupon owner type is invalid");
        }
        return couponRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc().stream()
                .filter(coupon -> "PLATFORM".equals(ownerType)
                        ? isAdmin(coupon.getAccount())
                        : isInstructor(coupon.getAccount()))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CouponResponse getCouponById(UUID id) {
        return mapToResponse(getOwnedCoupon(id));
    }

    @Transactional
    public CouponResponse updateCoupon(UUID id, CouponRequest request) {
        Coupon coupon = getOwnedCoupon(id);
        assertCouponHasNoSuccessfulUse(coupon, "chỉnh sửa");
        assertCouponHasNoPendingReservation(coupon, "chỉnh sửa");
        String code = normalizeCode(request.getCode());
        if (couponRepository.existsByCodeHashAndIdNot(couponCodeCipher.hash(code), id)
                || couponRepository.existsByEncryptedCodeIgnoreCaseAndIdNot(code, id)) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        applyRequest(coupon, request, code, getCurrentAccount());
        if (request.getStatus() != null) {
            coupon.setStatus(request.getStatus());
        }

        Coupon updatedCoupon = couponRepository.save(coupon);
        publishAuditLog("UPDATE_COUPON", updatedCoupon, getCurrentAccount());
        return mapToResponse(updatedCoupon);
    }

    @Transactional
    public CouponResponse updateCouponStatus(UUID id, Integer status) {
        if (!CouponStatus.isSupported(status)) {
            throw new IllegalArgumentException("Coupon status is invalid");
        }

        Coupon coupon = getOwnedCoupon(id);
        if (orderRepository.countByCoupon_IdAndStatus(coupon.getId(), com.gnostica.core.constant.OrderStatus.PAID) > 0
                && status != CouponStatus.INACTIVE) {
            throw new IllegalStateException("Coupon đã có lượt dùng chỉ có thể được tắt.");
        }
        coupon.setStatus(status);
        Coupon updatedCoupon = couponRepository.save(coupon);
        publishAuditLog("UPDATE_COUPON_STATUS", updatedCoupon, getCurrentAccount());
        return mapToResponse(updatedCoupon);
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        Coupon coupon = getOwnedCoupon(id);
        assertCouponHasNoSuccessfulUse(coupon, "xóa");
        assertCouponHasNoPendingReservation(coupon, "xóa");
        coupon.setDeletedAt(LocalDateTime.now());
        couponRepository.save(coupon);
        publishAuditLog("DELETE_COUPON", coupon, getCurrentAccount());
    }

    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(String code) {
        return mapToResponse(getValidCoupon(code));
    }

    @Transactional(readOnly = true)
    public CouponResponse validateCoupon(String code, UUID courseId) {
        Coupon coupon = getValidCoupon(code);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course does not exist"));
        assertCouponAppliesToCourse(coupon, course);
        return mapToResponse(coupon);
    }

    public Coupon getValidCoupon(String code) {
        String normalizedCode = normalizeCode(code);
        Coupon coupon = couponRepository.findByCodeHashAndDeletedAtIsNull(couponCodeCipher.hash(normalizedCode))
                .or(() -> couponRepository.findByEncryptedCodeIgnoreCaseAndDeletedAtIsNull(normalizedCode)
                        .filter(this::isPlaintextCode))
                .orElseThrow(() -> new IllegalArgumentException("Coupon does not exist"));

        if (coupon.getStatus() != CouponStatus.ACTIVE) {
            throw new IllegalArgumentException("Coupon is inactive or expired");
        }
        if (coupon.getValidUntil().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon has expired");
        }
        if (coupon.getValidFrom().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Coupon is not active yet");
        }
        int reservedQuantity = coupon.getReservedQuantity() == null ? 0 : coupon.getReservedQuantity();
        if (coupon.getQuantity() == null || coupon.getQuantity() - reservedQuantity <= 0) {
            throw new IllegalArgumentException("Coupon has no remaining uses");
        }

        return coupon;
    }

    public String getDisplayCode(Coupon coupon) {
        if (isPlaintextCode(coupon)) {
            return coupon.getEncryptedCode();
        }
        return couponCodeCipher.decrypt(coupon.getAccount().getId(), coupon.getEncryptedCode());
    }

    private boolean isPlaintextCode(Coupon coupon) {
        return coupon.getCodeHash() != null && coupon.getCodeHash().startsWith("PLAIN:");
    }

    @Transactional(readOnly = true)
    public List<CouponScopeOptionResponse> getScopeCourseOptions() {
        Account account = getCurrentAccount();
        List<Course> courses = isAdmin(account)
                ? courseRepository.findAllByDeletedAtIsNull()
                : courseRepository.findAllByDeletedAtIsNull().stream()
                        .filter(course -> course.getAccount() != null && course.getAccount().getId().equals(account.getId()))
                        .toList();
        return courses.stream()
                .map(course -> new CouponScopeOptionResponse(course.getId().toString(), course.getTitle(), null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CouponScopeOptionResponse> getScopeCategoryOptions() {
        Account account = getCurrentAccount();
        if (!isAdmin(account)) {
            throw new AccessDeniedException("Only administrators can select coupon categories");
        }
        return categoryRepository.findAll().stream()
                .map(category -> new CouponScopeOptionResponse(
                        String.valueOf(category.getId()),
                        category.getName(),
                        category.getParent() == null ? null : String.valueOf(category.getParent().getId())))
                .toList();
    }

    public void assertCouponAppliesToCourse(Coupon coupon, Course course) {
        CouponScopeMetadata metadata = readScopeMetadata(coupon.getMetadata(), coupon.getAccount());
        String scope = metadata.getScope();
        if (CouponScope.ALL_PLATFORM.equals(scope)) {
            return;
        }
        if (CouponScope.ALL_OWNER_COURSES.equals(scope)) {
            if (course.getAccount() != null && course.getAccount().getId().equals(coupon.getAccount().getId())) {
                return;
            }
            throw new IllegalArgumentException("Mã giảm chỉ khả dụng với một số khóa học");
        }
        if (CouponScope.COURSES.equals(scope) && metadata.getCourseIds().contains(course.getId())) {
            return;
        }
        if (CouponScope.CATEGORIES.equals(scope) && isCourseInSelectedCategoryScope(course, metadata.getCategoryIds())) {
            return;
        }
        throw new IllegalArgumentException("Mã giảm chỉ khả dụng với một số khóa học");
    }

    /**
     * Converts a coupon into the exact currency amount applied to the eligible
     * order subtotal. The result is persisted on the order and is never
     * recalculated from a percentage during payment or accounting.
     */
    public java.math.BigDecimal calculateDiscountAmount(Coupon coupon, java.math.BigDecimal eligibleSubtotal) {
        if (eligibleSubtotal == null || eligibleSubtotal.signum() < 0) {
            throw new IllegalArgumentException("Coupon subtotal is invalid");
        }
        if (coupon.getMinDiscount() != null && eligibleSubtotal.compareTo(coupon.getMinDiscount()) < 0) {
            throw new IllegalArgumentException("Order does not meet the coupon minimum amount");
        }

        java.math.BigDecimal discountAmount;
        if (CouponDiscountType.PERCENTAGE == coupon.getDiscountType()) {
            discountAmount = eligibleSubtotal.multiply(coupon.getDiscountValue())
                    .divide(java.math.BigDecimal.valueOf(100));
        } else if (CouponDiscountType.FIXED_AMOUNT == coupon.getDiscountType()) {
            discountAmount = coupon.getDiscountValue();
        } else {
            throw new IllegalArgumentException("Coupon discount type is invalid");
        }
        if (coupon.getMaxDiscount() != null && discountAmount.compareTo(coupon.getMaxDiscount()) > 0) {
            discountAmount = coupon.getMaxDiscount();
        }
        return discountAmount.max(java.math.BigDecimal.ZERO).min(eligibleSubtotal)
                .setScale(0, java.math.RoundingMode.HALF_UP);
    }

    private boolean isCourseInSelectedCategoryScope(Course course, List<Integer> selectedCategoryIds) {
        Category category = course.getCategory();
        while (category != null) {
            if (selectedCategoryIds.contains(category.getId())) {
                return true;
            }
            category = category.getParent();
        }
        return false;
    }

    private Account getCurrentAccount() {
        String email = AuthUtil.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new AccessDeniedException("Authentication is required");
        }
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Current account does not exist"));
    }

    private Coupon getOwnedCoupon(UUID id) {
        Coupon coupon = couponRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon does not exist"));
        Account account = getCurrentAccount();
        if (!coupon.getAccount().getId().equals(account.getId())) {
            throw new AccessDeniedException("Coupon belongs to another account");
        }
        return coupon;
    }

    private void applyRequest(Coupon coupon, CouponRequest request, String code, Account account) {
        validateInstructorQuantityLimit(request, account);
        coupon.setName(request.getName().trim());
        coupon.setEncryptedCode(couponCodeCipher.encrypt(account.getId(), code));
        coupon.setCodeHash(couponCodeCipher.hash(code));
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setMinDiscount(request.getMinDiscount());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        coupon.setQuantity(request.getQuantity());
        coupon.setMetadata(normalizeScopeMetadata(request.getMetadata(), account));
    }

    /**
     * A paid redemption is an accounting record. Its coupon must remain immutable
     * so historical orders can always be reconstructed from their references.
     */
    private void assertCouponHasNoSuccessfulUse(Coupon coupon, String action) {
        if (orderRepository.countByCoupon_IdAndStatus(coupon.getId(), com.gnostica.core.constant.OrderStatus.PAID) > 0) {
            throw new IllegalStateException("Không thể " + action
                    + " coupon đã có lượt dùng thành công. Hãy tắt coupon và tạo coupon mới.");
        }
    }

    private void assertCouponHasNoPendingReservation(Coupon coupon, String action) {
        if (orderRepository.countByCoupon_IdAndStatus(coupon.getId(), com.gnostica.core.constant.OrderStatus.PENDING) > 0) {
            throw new IllegalStateException("Không thể " + action
                    + " coupon đang được giữ bởi đơn chờ thanh toán.");
        }
    }

    private void validateInstructorQuantityLimit(CouponRequest request, Account account) {
        if (isAdmin(account) || request.getDiscountValue() == null || request.getQuantity() == null) {
            return;
        }
        if (request.getDiscountType() == CouponDiscountType.PERCENTAGE
                && request.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(90)) >= 0
                && request.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(100)) <= 0
                && request.getQuantity() != 1) {
            throw new IllegalArgumentException("Chỉ được tạo số 1 với mức Coupon này");
        }
        if (request.getDiscountType() != CouponDiscountType.FIXED_AMOUNT) {
            return;
        }
        int limit = request.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(500_000)) >= 0 ? 1
                : request.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(200_000)) >= 0 ? 2
                : request.getDiscountValue().compareTo(java.math.BigDecimal.valueOf(100_000)) >= 0 ? 5 : Integer.MAX_VALUE;
        if (request.getQuantity() > limit) {
            throw new IllegalArgumentException("Số lượng phát hành vượt mức tối đa cho mức Coupon này");
        }
    }

    private String normalizeScopeMetadata(String rawMetadata, Account account) {
        CouponScopeMetadata metadata = readScopeMetadata(rawMetadata, account);
        String scope = metadata.getScope();

        if (CouponScope.ALL_PLATFORM.equals(scope)) {
            if (!isAdmin(account)) {
                throw new AccessDeniedException("Only administrators can create platform-wide coupons");
            }
            metadata.setCourseIds(List.of());
            metadata.setCategoryIds(List.of());
        } else if (CouponScope.ALL_OWNER_COURSES.equals(scope)) {
            if (isAdmin(account)) {
                throw new IllegalArgumentException("Administrators must use ALL_PLATFORM instead");
            }
            metadata.setCourseIds(List.of());
            metadata.setCategoryIds(List.of());
        } else if (CouponScope.COURSES.equals(scope)) {
            validateSelectedCourses(metadata.getCourseIds(), account);
            metadata.setCategoryIds(List.of());
        } else if (CouponScope.CATEGORIES.equals(scope)) {
            if (!isAdmin(account)) {
                throw new AccessDeniedException("Only administrators can create category coupons");
            }
            validateSelectedCategories(metadata.getCategoryIds());
            metadata.setCourseIds(List.of());
        } else {
            throw new IllegalArgumentException("Coupon scope is invalid");
        }

        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new IllegalArgumentException("Coupon scope metadata is invalid");
        }
    }

    private CouponScopeMetadata readScopeMetadata(String rawMetadata, Account account) {
        CouponScopeMetadata metadata;
        if (rawMetadata == null || rawMetadata.isBlank()) {
            metadata = new CouponScopeMetadata();
            metadata.setScope(isAdmin(account) ? CouponScope.ALL_PLATFORM : CouponScope.ALL_OWNER_COURSES);
        } else {
            try {
                metadata = objectMapper.readValue(rawMetadata, CouponScopeMetadata.class);
            } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
                throw new IllegalArgumentException("Coupon scope metadata is invalid");
            }
        }
        if (metadata.getScope() == null || metadata.getScope().isBlank()) {
            metadata.setScope(isAdmin(account) ? CouponScope.ALL_PLATFORM : CouponScope.ALL_OWNER_COURSES);
        }
        metadata.setScope(metadata.getScope().trim().toUpperCase(Locale.ROOT));
        metadata.setCourseIds(metadata.getCourseIds() == null ? List.of() : metadata.getCourseIds());
        metadata.setCategoryIds(metadata.getCategoryIds() == null ? List.of() : metadata.getCategoryIds());
        return metadata;
    }

    private void validateSelectedCourses(List<UUID> courseIds, Account account) {
        if (courseIds == null || courseIds.isEmpty()) {
            throw new IllegalArgumentException("Select at least one course for this coupon");
        }
        Set<UUID> selectedIds = new HashSet<>(courseIds);
        List<Course> courses = courseRepository.findAllByIdInAndDeletedAtIsNull(selectedIds);
        if (courses.size() != selectedIds.size()) {
            throw new IllegalArgumentException("One or more selected courses do not exist");
        }
        if (!isAdmin(account) && courses.stream().anyMatch(course -> course.getAccount() == null
                || !course.getAccount().getId().equals(account.getId()))) {
            throw new AccessDeniedException("Instructors can select only their own courses");
        }
    }

    private void validateSelectedCategories(List<Integer> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            throw new IllegalArgumentException("Select at least one category for this coupon");
        }
        Set<Integer> selectedIds = new HashSet<>(categoryIds);
        if (categoryRepository.findAllById(selectedIds).size() != selectedIds.size()) {
            throw new IllegalArgumentException("One or more selected categories do not exist");
        }
    }

    private boolean isAdmin(Account account) {
        return account.getRole() != null && "ADMIN".equalsIgnoreCase(account.getRole().getName());
    }

    private boolean isInstructor(Account account) {
        if (account.getRole() == null || account.getRole().getName() == null) {
            return false;
        }
        String roleName = account.getRole().getName();
        return "INSTRUCTOR".equalsIgnoreCase(roleName) || "TEACHER".equalsIgnoreCase(roleName);
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private void publishAuditLog(String action, Coupon coupon, Account account) {
        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "target_type", "Coupon",
                    "target_id", coupon.getId().toString(),
                    "code_hash", coupon.getCodeHash(),
                    "discount_value", coupon.getDiscountValue()));
            eventPublisher.publishEvent(new LogEvent(this, action, payload, account.getId()));
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            log.warn("Could not publish log event for {}: {}", action, exception.getMessage());
        }
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        long usedCount = orderRepository.countByCoupon_IdAndStatus(coupon.getId(), com.gnostica.core.constant.OrderStatus.PAID);
        int totalQuantity = (coupon.getQuantity() == null ? 0 : coupon.getQuantity())
                + (coupon.getReservedQuantity() == null ? 0 : coupon.getReservedQuantity())
                + Math.toIntExact(usedCount);
        return CouponResponse.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .code(getDisplayCode(coupon))
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .maxDiscount(coupon.getMaxDiscount())
                .minDiscount(coupon.getMinDiscount())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .quantity(coupon.getQuantity())
                .usedCount(usedCount)
                .totalQuantity(totalQuantity)
                .status(coupon.getStatus())
                .metadata(coupon.getMetadata())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .accountId(coupon.getAccount().getId())
                .accountName(coupon.getAccount().getFullName())
                .accountEmail(coupon.getAccount().getEmail())
                .accountAvatar(coupon.getAccount().getAvatar())
                .sponsorType(isAdmin(coupon.getAccount()) ? "PLATFORM" : "INSTRUCTOR")
                .build();
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (Coupon coupon : couponRepository.findAllByCodeHashIsNull()) {
            String rawCode = coupon.getEncryptedCode().trim().toUpperCase(Locale.ROOT);
            String codeHash = couponCodeCipher.hash(rawCode);
            if (couponRepository.existsByCodeHashAndIdNot(codeHash, coupon.getId())) {
                throw new IllegalStateException("Duplicate coupon code found while converting seeded coupons");
            }
            coupon.setCodeHash(codeHash);
            coupon.setEncryptedCode(couponCodeCipher.encrypt(coupon.getAccount().getId(), rawCode));
        }
    }
}

