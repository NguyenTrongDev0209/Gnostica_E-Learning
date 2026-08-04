package com.gnostica.modules.wallet.controller;
import com.gnostica.modules.wallet.service.*;
import com.gnostica.modules.wallet.dto.response.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

import com.gnostica.core.dto.response.ApiResponse;
import com.gnostica.modules.wallet.service.PayoutsService;

import vn.payos.model.v1.payouts.Payout;
import vn.payos.model.v1.payoutsAccount.PayoutAccountInfo;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payouts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PayoutsController {
	private final PayoutsService payoutsService;

	@GetMapping("/{payoutId}")
	public ApiResponse<Payout> retrieve(@PathVariable String payoutId) {
		try {
			Payout payout = payoutsService.retrievePayout(payoutId);
			return ApiResponse.success(payout);
		} catch (Exception e) {
			e.printStackTrace();
			return ApiResponse.error("fail");
		}
	}

	@GetMapping("/list")
	public ApiResponse<List<Payout>> retrieveList(@RequestParam(required = false) String referenceId,
			@RequestParam(required = false) String approvalState, @RequestParam(required = false) List<String> category,
			@RequestParam(required = false) String fromDate, @RequestParam(required = false) String toDate,
			@RequestParam(required = false) Integer limit, @RequestParam(required = false) Integer offset) {
		try {
			List<Payout> data = payoutsService.retrievePayoutList(referenceId, approvalState, category, fromDate,
					toDate, limit, offset);
			return ApiResponse.success(data);
		} catch (Exception e) {
			e.printStackTrace();
			return ApiResponse.error("fail");
		}
	}

	@GetMapping("/balance")
	public ApiResponse<PayoutAccountInfo> getAccountBalance() {
		try {
			PayoutAccountInfo accountInfo = payoutsService.getAccountBalance();
			return ApiResponse.success(accountInfo);
		} catch (Exception e) {
			e.printStackTrace();
			return ApiResponse.error("fail");
		}
	}
}
