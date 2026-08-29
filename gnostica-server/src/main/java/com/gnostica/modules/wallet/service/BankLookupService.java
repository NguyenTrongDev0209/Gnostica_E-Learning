package com.gnostica.modules.wallet.service;

import com.gnostica.core.model.Bank;
import com.gnostica.core.repository.BankRepository;
import com.gnostica.modules.wallet.dto.response.BankLookupBankDto;
import com.gnostica.modules.wallet.dto.response.BankLookupBankListResponse;
import com.gnostica.modules.wallet.dto.response.BankLookupOwnerResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Tra cứu tên chủ tài khoản ngân hàng qua dịch vụ BankLookup.
 * Tài liệu: https://banklookup.net/document/lookup
 */
@Service
@Slf4j
public class BankLookupService {

    private static final String LOOKUP_URL = "https://api.banklookup.net";
    private static final String BANK_LIST_URL = "https://api.banklookup.net/bank/list";

    @Value("${banklookup.api-key:}")
    private String apiKey;

    @Value("${banklookup.api-secret:}")
    private String apiSecret;

    private final BankRepository bankRepository;
    private final RestTemplate restTemplate;

    /** Cache map bin (VietQR) -> code BankLookup, chỉ gồm ngân hàng lookup_supported = 1. */
    private volatile Map<String, String> binToCodeCache;

    public BankLookupService(BankRepository bankRepository) {
        this.bankRepository = bankRepository;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(8000);
        factory.setReadTimeout(8000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Tra cứu tên chủ tài khoản theo bin + số tài khoản.
     *
     * @return tên chủ tài khoản
     */
    public String lookupAccountName(String bin, String accountNumber) {
        if (apiKey == null || apiKey.isBlank() || apiSecret == null || apiSecret.isBlank()) {
            throw new RuntimeException("Chưa cấu hình dịch vụ tra cứu tên tài khoản. Vui lòng liên hệ quản trị viên.");
        }
        if (accountNumber == null || !accountNumber.matches("\\d{6,25}")) {
            throw new RuntimeException("Số tài khoản không hợp lệ.");
        }

        String bankCode = resolveBankCode(bin);
        if (bankCode == null) {
            throw new RuntimeException("Ngân hàng này chưa được hỗ trợ tra cứu tên tài khoản.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("x-api-secret", apiSecret);

        Map<String, Object> body = new HashMap<>();
        body.put("bank", bankCode);
        body.put("account", accountNumber);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        BankLookupOwnerResponse response;
        try {
            response = restTemplate.exchange(LOOKUP_URL, HttpMethod.POST, entity, BankLookupOwnerResponse.class).getBody();
        } catch (HttpStatusCodeException e) {
            throw mapHttpError(e.getStatusCode().value());
        } catch (ResourceAccessException e) {
            log.error("BankLookup network error: {}", e.getMessage());
            throw new RuntimeException("Không thể kết nối dịch vụ tra cứu ngân hàng. Vui lòng thử lại.");
        }

        String ownerName = response != null && response.getData() != null ? response.getData().getOwnerName() : null;
        if (ownerName == null || ownerName.isBlank()) {
            throw new RuntimeException("Không tìm thấy tên tài khoản. Vui lòng kiểm tra lại số tài khoản và ngân hàng.");
        }
        return ownerName.trim();
    }

    private String resolveBankCode(String bin) {
        if (bin == null || bin.isBlank()) {
            throw new RuntimeException("Vui lòng chọn ngân hàng.");
        }
        Optional<Bank> bankOpt = bankRepository.findByBin(bin);
        if (bankOpt.isEmpty()) {
            throw new RuntimeException("Ngân hàng không hợp lệ.");
        }
        Map<String, String> map = getBinToCodeMap();
        String code = map.get(bin);
        if (code == null) {
            code = map.get(bin.replaceFirst("^0+", ""));
        }
        return code;
    }

    private Map<String, String> getBinToCodeMap() {
        Map<String, String> current = binToCodeCache;
        if (current == null) {
            synchronized (this) {
                current = binToCodeCache;
                if (current == null) {
                    current = loadBankCodeMap();
                    binToCodeCache = current;
                }
            }
        }
        return current;
    }

    private Map<String, String> loadBankCodeMap() {
        Map<String, String> map = new HashMap<>();
        try {
            BankLookupBankListResponse response = restTemplate.getForObject(BANK_LIST_URL, BankLookupBankListResponse.class);
            if (response != null && response.getData() != null) {
                for (BankLookupBankDto dto : response.getData()) {
                    if (dto.getBin() != null && dto.getCode() != null && !dto.getCode().isBlank()
                            && dto.getLookupSupported() != null && dto.getLookupSupported() == 1) {
                        map.put(String.valueOf(dto.getBin()), dto.getCode());
                    }
                }
            }
            log.info("BankLookup: loaded {} supported banks.", map.size());
            if (map.isEmpty()) {
                log.warn("BankLookup: bank list loaded but 0 supported banks matched. "
                        + "Check bin/code/lookup_supported field mapping.");
            }
        } catch (Exception e) {
            log.error("BankLookup: failed to load bank list: {}", e.getMessage());
        }
        return map;
    }

    private RuntimeException mapHttpError(int status) {
        return switch (status) {
            case 422 -> new RuntimeException("Không tìm thấy tài khoản tại ngân hàng. Vui lòng kiểm tra lại số tài khoản.");
            case 402 -> new RuntimeException("Dịch vụ tra cứu đã hết credit. Vui lòng liên hệ quản trị viên.");
            case 429 -> new RuntimeException("Đang có quá nhiều yêu cầu tra cứu. Vui lòng thử lại sau.");
            default -> new RuntimeException("Dịch vụ tra cứu đang gặp sự cố. Vui lòng thử lại.");
        };
    }
}
