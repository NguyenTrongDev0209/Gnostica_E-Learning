package com.gnostica.modules.checkout.service;

import com.gnostica.core.constant.OrderStatus;
import com.gnostica.core.constant.PaymentStatus;
import com.gnostica.core.model.Order;
import com.gnostica.core.model.Payment;
import com.gnostica.core.model.Payout;
import com.gnostica.core.model.Refund;
import com.gnostica.core.repository.OrderRepository;
import com.gnostica.core.repository.PaymentRepository;
import com.gnostica.core.repository.PayoutRepository;
import com.gnostica.core.repository.RefundRepository;
import com.gnostica.modules.checkout.dto.response.AdminTransactionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTransactionService {

    private static final int PURCHASE_TRANSACTION_TYPE = 2;
    private static final int WITHDRAWAL_TRANSACTION_TYPE = 3;
    private static final int REFUND_TRANSACTION_TYPE = 4;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PayoutRepository payoutRepository;
    private final RefundRepository refundRepository;

    @Transactional(readOnly = true)
    public List<AdminTransactionResponse> getTransactions(String module) {
        return switch (module == null ? "payments" : module.trim().toLowerCase()) {
            case "payments" -> getPayments();
            case "withdrawals" -> getWithdrawals();
            case "refunds" -> getRefunds();
            default -> throw new IllegalArgumentException("Unsupported transaction module: " + module);
        };
    }

    private List<AdminTransactionResponse> getPayments() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        if (orders.isEmpty()) {
            return List.of();
        }

        List<UUID> orderIds = orders.stream().map(Order::getId).toList();
        Map<UUID, Payment> latestPaymentByOrderId = paymentRepository
                .findByOrderIdsOrderByCreatedAtDesc(orderIds)
                .stream()
                .collect(Collectors.toMap(
                        payment -> payment.getOrder().getId(),
                        Function.identity(),
                        (latest, ignored) -> latest));

        return orders.stream()
                .map(order -> toResponse(order, latestPaymentByOrderId.get(order.getId())))
                .toList();
    }

    private List<AdminTransactionResponse> getWithdrawals() {
        return payoutRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toWithdrawalResponse)
                .toList();
    }

    private List<AdminTransactionResponse> getRefunds() {
        return refundRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toRefundResponse)
                .toList();
    }

    private AdminTransactionResponse toResponse(Order order, Payment payment) {
        Map<String, Object> payload = payment != null ? payment.getPayload() : null;

        return AdminTransactionResponse.builder()
                .id(order.getId())
                .transactionCode(order.getOrderCode() != null ? "TT" + order.getOrderCode() : null)
                .performerName(order.getAccount().getFullName())
                .performerEmail(order.getAccount().getEmail())
                .performerAvatar(order.getAccount().getAvatar())
                .amount(order.getTotalPrice())
                .type(PURCHASE_TRANSACTION_TYPE)
                .paymentMethod(order.getPaymentMethod())
                .status(toPaymentStatus(order.getStatus()))
                .statusLabel(paymentStatusLabel(order.getStatus()))
                .createdAt(order.getCreatedAt())
                .paidAt(payment != null ? payment.getPaidAt() : null)
                .senderBankId(payloadValue(payload, "senderBankCode", "bankCode"))
                .senderAccountNumber(payloadValue(payload, "senderAccountNumber", "accountNumber"))
                .ref(payloadValue(payload, "description", "orderInfo"))
                .log(payload)
                .build();
    }

    private AdminTransactionResponse toWithdrawalResponse(Payout payout) {
        String bankName = payout.getAccountBank() != null && payout.getAccountBank().getBank() != null
                ? payout.getAccountBank().getBank().getShortName()
                : "PAYOS";

        return AdminTransactionResponse.builder()
                .id(payout.getId())
                .transactionCode(firstNonBlank(
                        payout.getGatewayReferenceId(),
                        payout.getGatewayPayoutId(),
                        payout.getId().toString()))
                .performerName(payout.getAccount().getFullName())
                .performerEmail(payout.getAccount().getEmail())
                .performerAvatar(payout.getAccount().getAvatar())
                .amount(payout.getAmount())
                .type(WITHDRAWAL_TRANSACTION_TYPE)
                .paymentMethod(bankName)
                .status(payoutStatus(payout.getStatus()))
                .statusLabel(payoutStatusLabel(payout.getStatus()))
                .createdAt(payout.getCreatedAt())
                .paidAt(payout.getStatus() != null && payout.getStatus() == 3 ? payout.getUpdatedAt() : null)
                .senderBankId(bankName)
                .senderAccountNumber(payout.getAccountBank() != null
                        ? payout.getAccountBank().getAccountNumber()
                        : null)
                .ref(payout.getLastSubmissionError())
                .build();
    }

    private AdminTransactionResponse toRefundResponse(Refund refund) {
        Long orderCode = refund.getOrderDetail() != null && refund.getOrderDetail().getOrder() != null
                ? refund.getOrderDetail().getOrder().getOrderCode()
                : null;

        return AdminTransactionResponse.builder()
                .id(refund.getId())
                .transactionCode(orderCode != null ? orderCode.toString() : refund.getId().toString())
                .performerName(refund.getAccount().getFullName())
                .performerEmail(refund.getAccount().getEmail())
                .performerAvatar(refund.getAccount().getAvatar())
                .amount(refund.getAmount())
                .type(REFUND_TRANSACTION_TYPE)
                .paymentMethod("VÍ GNOSTICA")
                .status(refundStatus(refund.getStatus()))
                .statusLabel(refundStatusLabel(refund.getStatus()))
                .createdAt(refund.getCreatedAt())
                .paidAt(refund.getStatus() != null && refund.getStatus() == 2 ? refund.getUpdatedAt() : null)
                .ref(refund.getReason())
                .build();
    }

    private int toPaymentStatus(Integer orderStatus) {
        if (orderStatus == null || orderStatus == OrderStatus.PENDING) {
            return PaymentStatus.PENDING;
        }
        if (orderStatus == OrderStatus.PAID) {
            return PaymentStatus.SUCCESS;
        }
        if (orderStatus == OrderStatus.REFUNDED) {
            return PaymentStatus.REFUNDED;
        }
        return PaymentStatus.FAILED;
    }

    private String paymentStatusLabel(Integer orderStatus) {
        if (orderStatus == null || orderStatus == OrderStatus.PENDING) return "Chờ thanh toán";
        if (orderStatus == OrderStatus.PAID) return "Thành công";
        if (orderStatus == OrderStatus.REFUNDED) return "Đã hoàn tiền";
        return "Đã hủy";
    }

    private int payoutStatus(Integer status) {
        if (status == null || status == 1 || status == 2) return PaymentStatus.PENDING;
        if (status == 3) return PaymentStatus.SUCCESS;
        return PaymentStatus.FAILED;
    }

    private String payoutStatusLabel(Integer status) {
        if (status == null || status == 1) return "Chờ duyệt";
        if (status == 2) return "Đang chuyển";
        if (status == 3) return "Hoàn tất";
        if (status == 5) return "Từ chối";
        return "Lỗi";
    }

    private int refundStatus(Integer status) {
        if (status == null || status == 1) return PaymentStatus.PENDING;
        if (status == 2) return PaymentStatus.REFUNDED;
        return PaymentStatus.FAILED;
    }

    private String refundStatusLabel(Integer status) {
        if (status == null || status == 1) return "Chờ duyệt";
        if (status == 2) return "Đã hoàn tiền";
        return "Từ chối";
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    private String payloadValue(Map<String, Object> payload, String... keys) {
        if (payload == null) {
            return null;
        }

        for (String key : keys) {
            Object value = payload.get(key);
            if (value != null && !value.toString().isBlank()) {
                return value.toString();
            }
        }
        return null;
    }
}
