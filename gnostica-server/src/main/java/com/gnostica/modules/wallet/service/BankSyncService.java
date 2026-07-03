package com.gnostica.modules.wallet.service;
import com.gnostica.modules.wallet.service.*;
import com.gnostica.modules.wallet.dto.response.*;
import com.gnostica.service.*;

import com.gnostica.modules.wallet.dto.response.VietQrBankDto;
import com.gnostica.modules.wallet.dto.response.VietQrResponse;
import com.gnostica.core.model.Bank;
import com.gnostica.core.repository.BankRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Service
public class BankSyncService {

    private final BankRepository bankRepository;
    private final RestTemplate restTemplate;

    public BankSyncService(BankRepository bankRepository) {
        this.bankRepository = bankRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional(rollbackFor = Exception.class)
    public void syncBanksData() {
        String url = "https://api.vietqr.io/v2/banks";
        
        try {
            VietQrResponse response = restTemplate.getForObject(url, VietQrResponse.class);
            
            if (response != null && "00".equals(response.getCode()) && response.getData() != null) {
                int count = 0;
                for (VietQrBankDto dto : response.getData()) {
                    
                    // Kiểm tra xem Ngân hàng này đã có trong Database chưa, tìm theo ID từ API trả về
                    Bank bank = bankRepository.findByExternalId(dto.getId())
                            .orElseGet(() -> {
                                // Nếu chưa có thì khởi tạo mới
                                Bank newBank = new Bank();
                                newBank.setExternalId(dto.getId());
                                newBank.setCreatedAt(LocalDateTime.now());
                                return newBank;
                            });

                    // Cập nhật lại những thông tin mới nhất
                    bank.setBankCode(dto.getCode());
                    bank.setBin(dto.getBin());
                    bank.setShortName(dto.getShortName());
                    bank.setLogoUrl(dto.getLogo());
                    bank.setStatus(1); // Mặc định là Active
                    
                    // Lưu vào DB (nếu đã tìm thấy bên trên, Spring Data JPA sẽ tự động Update. Nếu chưa, nó sẽ Insert mới)
                    bankRepository.save(bank);
                    count++;
                }
                
                System.out.println("Sync successful: " + count + " banks.");
            } else {
                System.out.println("Failed to get data from API.");
            }
        } catch (Exception e) {
            System.err.println("Error during bank sync: " + e.getMessage());
            // Ném lỗi ra lại để transaction trigger việc ROLLBACK
            throw new RuntimeException("Sync Failed", e);
        }
    }
}
