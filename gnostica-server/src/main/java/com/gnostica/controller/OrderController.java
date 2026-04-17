package com.gnostica.controller;

import com.gnostica.dto.response.PaymentLinkResponse;
import com.gnostica.dto.request.CreatePaymentLinkRequestBody;
import com.gnostica.dto.response.ApiResponse;
import com.gnostica.model.Order;
import com.gnostica.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
	private final OrderService orderService;

	@GetMapping("/all")
	public ApiResponse<List<Order>> getAllOrders() {
		try {
			return ApiResponse.success(orderService.getAllOrders());
		} catch (Exception e) {
			log.error("Error fetching all orders", e);
			return ApiResponse.error("fail");
		}
	}

	@PostMapping(path = "/create")
	public ApiResponse<PaymentLinkResponse> createPaymentLink(@RequestBody CreatePaymentLinkRequestBody requestBody) {
		try {
			PaymentLinkResponse data = orderService.createPaymentLink(requestBody);
			return ApiResponse.success(data);
		} catch (Exception e) {
			log.error("Error creating payment link", e);
			return ApiResponse.error("fail: " + e.getMessage());
		}
	}
}
