package com.gnostica.modules.checkout.controller;

import com.gnostica.modules.checkout.dto.response.PaymentLinkResponse;
import com.gnostica.modules.checkout.dto.request.CreatePaymentLinkRequestBody;
import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.checkout.dto.response.OrderResponse;
import com.gnostica.modules.checkout.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/checkout/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
	private final OrderService orderService;

	@GetMapping(value = "/all")
	@PreAuthorize("hasRole('ADMIN')")
	public ApiResponse<List<OrderResponse>> getAllOrders() {
		try {
			return ApiResponse.success(orderService.getAllOrders());
		} catch (Exception e) {
			log.error("Lá»—i khi láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng", e);
			return ApiResponse.error("Lá»—i khi láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng");
		}
	}

	@GetMapping(value = "/my-orders")
	public ApiResponse<List<OrderResponse>> getMyOrders(org.springframework.security.core.Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ApiResponse.error("Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem danh sÃ¡ch Ä‘Æ¡n hÃ ng");
		}
		try {
			return ApiResponse.success(orderService.getMyOrders(authentication.getName()));
		} catch (Exception e) {
			log.error("Lá»—i khi láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng cÃ¡ nhÃ¢n", e);
			return ApiResponse.error("Lá»—i khi láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng cÃ¡ nhÃ¢n");
		}
	}

	@PostMapping(path = "/create")
	public ApiResponse<PaymentLinkResponse> createPaymentLink(@RequestBody CreatePaymentLinkRequestBody requestBody) {
		try {
			PaymentLinkResponse data = orderService.createPaymentLink(requestBody);
			return ApiResponse.success(data);
		} catch (IllegalArgumentException e) {
			if (OrderService.ACCOUNT_NOT_ELIGIBLE.equals(e.getMessage())) {
				return ApiResponse.error(1001, OrderService.ACCOUNT_NOT_ELIGIBLE);
			}
			if (OrderService.COURSE_NOT_AVAILABLE.equals(e.getMessage())) {
				return ApiResponse.error(1002, OrderService.COURSE_NOT_AVAILABLE);
			}
			if (OrderService.OWN_COURSE_PURCHASE_NOT_ALLOWED.equals(e.getMessage())) {
				return ApiResponse.error(1003, OrderService.OWN_COURSE_PURCHASE_NOT_ALLOWED);
			}
			if (OrderService.ALREADY_ENROLLED.equals(e.getMessage())) {
				return ApiResponse.error(1004, OrderService.ALREADY_ENROLLED);
			}
			log.warn("KhÃ´ng thá»ƒ táº¡o link thanh toÃ¡n: {}", e.getMessage());
			return ApiResponse.error("KhÃ´ng thá»ƒ táº¡o link thanh toÃ¡n");
		} catch (Exception e) {
			log.error("Lá»—i khi táº¡o link thanh toÃ¡n", e);
			return ApiResponse.error("Lá»—i khi táº¡o link thanh toÃ¡n: " + e.getMessage());
		}
	}

	@PutMapping("/{orderCode}/cancel")
	public ApiResponse<OrderResponse> cancelOrder(@PathVariable Long orderCode) {
		try {
			return ApiResponse.success(orderService.cancelPendingOrder(orderCode));
		} catch (Exception e) {
			log.warn("KhÃ´ng thá»ƒ há»§y Ä‘Æ¡n {}: {}", orderCode, e.getMessage());
			return ApiResponse.error("KhÃ´ng thá»ƒ há»§y thanh toÃ¡n");
		}
	}

	@GetMapping("/{idOrCode}")
	public ApiResponse<OrderResponse> getOrderById(@PathVariable String idOrCode) {
		try {
			OrderResponse order;
			try {
				UUID id = UUID.fromString(idOrCode);
				order = orderService.getOrderById(id);
			} catch (IllegalArgumentException e) {
				try {
					order = orderService.getOrderByOrderCode(Long.valueOf(idOrCode));
				} catch (NumberFormatException ignored) {
					order = orderService.getOrderByTransactionId(idOrCode);
				}
			}
			return ApiResponse.success(order);
		} catch (Exception e) {
			log.error("Lá»—i khi láº¥y thÃ´ng tin Ä‘Æ¡n hÃ ng", e);
			return ApiResponse.error("Lá»—i khi láº¥y thÃ´ng tin Ä‘Æ¡n hÃ ng: " + e.getMessage());
		}
	}

	@GetMapping("/paged")
	@PreAuthorize("hasRole('ADMIN')")
	public ApiResponse<org.springframework.data.domain.Page<OrderResponse>> getOrdersPaginated(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		try {
			return ApiResponse.success(orderService.getOrdersPaginated(page, size));
		} catch (Exception e) {
			log.error("Lá»—i khi láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng phÃ¢n trang", e);
			return ApiResponse.error("Lá»—i khi láº¥y danh sÃ¡ch Ä‘Æ¡n hÃ ng phÃ¢n trang");
		}
	}
}

