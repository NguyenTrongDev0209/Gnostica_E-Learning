package com.gnostica.modules.payment.controller;

import com.gnostica.core.config.VNPayProperties;
import com.gnostica.modules.payment.dto.response.PaymentWebhookData;
import com.gnostica.modules.payment.dto.response.VNPayIpnResponse;
import com.gnostica.modules.payment.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class PaymentControllerVNPayTests {
    private PaymentService paymentService;
    private PaymentController controller;

    @BeforeEach
    void setUp() {
        paymentService = mock(PaymentService.class);
        VNPayProperties properties = new VNPayProperties();
        properties.setFrontendReturnUrl("https://app.example.com/checkout/success");
        controller = new PaymentController(paymentService, properties);
    }

    @Test
    void returnUrlOnlyVerifiesAndRedirects() throws Exception {
        Map<String, String> parameters = Map.of("vnp_TxnRef", "123");
        when(paymentService.verifyWebhook("VNPAY", parameters)).thenReturn(PaymentWebhookData.builder()
                .orderCode(123L)
                .status("PAID")
                .build());

        RedirectView result = controller.vnPayReturn(parameters);

        assertThat(result.getUrl()).isEqualTo("https://app.example.com/checkout/success?orderCode=123&gateway=VNPAY&paymentStatus=PAID&verified=true");
        verify(paymentService, never()).handleVNPayIpn(any());
        verify(paymentService, never()).processSuccessfulOrder(any());
    }

    @Test
    void invalidReturnSignatureDoesNotExposeOrderCode() throws Exception {
        when(paymentService.verifyWebhook(eq("VNPAY"), any())).thenThrow(new IllegalArgumentException("bad signature"));

        RedirectView result = controller.vnPayReturn(Map.of());

        assertThat(result.getUrl()).isEqualTo("https://app.example.com/checkout/success?gateway=VNPAY&paymentStatus=INVALID&verified=false");
    }

    @Test
    void ipnResponseIsReturnedWithoutApiWrapper() {
        VNPayIpnResponse response = VNPayIpnResponse.success();
        when(paymentService.handleVNPayIpn(any())).thenReturn(response);

        assertThat(controller.vnPayIpn(Map.of())).isSameAs(response);
    }
}
