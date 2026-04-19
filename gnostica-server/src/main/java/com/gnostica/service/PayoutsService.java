package com.gnostica.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.core.Page;
import vn.payos.model.v1.payouts.GetPayoutListParams;
import vn.payos.model.v1.payouts.GetPayoutListParams.GetPayoutListParamsBuilder;
import vn.payos.model.v1.payouts.Payout;
import vn.payos.model.v1.payouts.PayoutApprovalState;
import vn.payos.model.v1.payouts.PayoutRequests;
import vn.payos.model.v1.payouts.batch.PayoutBatchItem;
import vn.payos.model.v1.payouts.batch.PayoutBatchRequest;
import vn.payos.model.v1.payoutsAccount.PayoutAccountInfo;
import org.springframework.beans.factory.annotation.Qualifier;

@Service
public class PayoutsService {
    private final PayOS payOS;

    public PayoutsService(@Qualifier("payOSPayout") PayOS payOS) {
        this.payOS = payOS;
    }

    public Payout createPayout(PayoutRequests body) throws Exception {
        if (body.getReferenceId() == null || body.getReferenceId().isEmpty()) {
            body.setReferenceId("payout_" + (System.currentTimeMillis() / 1000));
        }
        return payOS.payouts().create(body);
    }

    public Payout createBatchPayout(PayoutBatchRequest body) throws Exception {
        if (body.getReferenceId() == null || body.getReferenceId().isEmpty()) {
            body.setReferenceId("payout_" + (System.currentTimeMillis() / 1000));
        }

        List<PayoutBatchItem> payoutsList = body.getPayouts();
        if (payoutsList != null) {
            for (int i = 0; i < payoutsList.size(); i++) {
                PayoutBatchItem batchItem = payoutsList.get(i);
                if (batchItem.getReferenceId() == null) {
                    batchItem.setReferenceId("payout_" + (System.currentTimeMillis() / 1000) + "_" + i);
                }
            }
        } else {
            throw new IllegalArgumentException("Payout batch list cannot be empty");
        }

        return payOS.payouts().batch().create(body);
    }

    public Payout retrievePayout(String payoutId) throws Exception {
        return payOS.payouts().get(payoutId);
    }

    public List<Payout> retrievePayoutList(
            String referenceId,
            String approvalState,
            List<String> category,
            String fromDate,
            String toDate,
            Integer limit,
            Integer offset) throws Exception {
        
        GetPayoutListParamsBuilder paramsBuilder = GetPayoutListParams.builder()
                .referenceId(referenceId)
                .category(category)
                .limit(limit)
                .offset(offset);
        
        if (fromDate != null && !fromDate.isEmpty()) {
            paramsBuilder.fromDate(fromDate);
        }
        if (toDate != null && !toDate.isEmpty()) {
            paramsBuilder.toDate(toDate);
        }

        if (approvalState != null && !approvalState.isEmpty()) {
            try {
                paramsBuilder.approvalState(PayoutApprovalState.valueOf(approvalState.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid approval state: " + approvalState);
            }
        }

        GetPayoutListParams params = paramsBuilder.build();
        List<Payout> data = new ArrayList<>();
        Page<Payout> page = payOS.payouts().list(params);
        page.autoPager().stream().forEach(data::add);
        return data;
    }

    public PayoutAccountInfo getAccountBalance() throws Exception {
        return payOS.payoutsAccount().balance();
    }
}
