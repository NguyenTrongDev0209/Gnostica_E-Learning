package com.gnostica.modules.order.controller;

import com.gnostica.modules.payment.dto.response.PaymentLinkResponse;
import com.gnostica.modules.payment.dto.request.CreatePaymentLinkRequestBody;
import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.order.dto.response.OrderResponse;
import com.gnostica.modules.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@CrossOrigin(origins = "*")
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
			log.error("Lỗi khi lấy danh sách đơn hàng", e);
			return ApiResponse.error("Lỗi khi lấy danh sách đơn hàng");
		}
	}

	@GetMapping(value = "/my-orders")
	public ApiResponse<List<OrderResponse>> getMyOrders(org.springframework.security.core.Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ApiResponse.error("Vui lòng đăng nhập để xem danh sách đơn hàng");
		}
		try {
			return ApiResponse.success(orderService.getMyOrders(authentication.getName()));
		} catch (Exception e) {
			log.error("Lỗi khi lấy danh sách đơn hàng cá nhân", e);
			return ApiResponse.error("Lỗi khi lấy danh sách đơn hàng cá nhân");
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
			log.error("Lỗi khi tạo link thanh toán", e);
			return ApiResponse.error("Lỗi khi tạo link thanh toán: " + e.getMessage());
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
			log.error("Lỗi khi lấy thông tin đơn hàng", e);
			return ApiResponse.error("Lỗi khi lấy thông tin đơn hàng: " + e.getMessage());
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
			log.error("Lỗi khi lấy danh sách đơn hàng phân trang", e);
			return ApiResponse.error("Lỗi khi lấy danh sách đơn hàng phân trang");
		}
	}
}
