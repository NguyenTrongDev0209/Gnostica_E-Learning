package com.gnostica.modules.wallet.service;
import com.gnostica.service.*;

import com.gnostica.core.model.Bank;
import com.gnostica.core.repository.BankRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BankService {

    private final BankRepository bankRepository;

    public BankService(BankRepository bankRepository) {
        this.bankRepository = bankRepository;
    }

    public List<Bank> getAllBanks() {
        return bankRepository.findAll();
    }

    public Optional<Bank> getBankById(Long id) {
        return bankRepository.findById(id);
    }

    @Transactional
    public Bank saveBank(Bank bank) {
        if (bank.getCreatedAt() == null) {
            bank.setCreatedAt(LocalDateTime.now());
        }
        return bankRepository.save(bank);
    }

    @Transactional
    public Optional<Bank> updateBank(Long id, Bank bankDetails) {
        return bankRepository.findById(id).map(bank -> {
            bank.setBankCode(bankDetails.getBankCode());
            bank.setBin(bankDetails.getBin());
            bank.setShortName(bankDetails.getShortName());
            bank.setLogoUrl(bankDetails.getLogoUrl());
            bank.setStatus(bankDetails.getStatus());
            return bankRepository.save(bank);
        });
    }

    @Transactional
    public boolean deleteBank(Long id) {
        return bankRepository.findById(id).map(bank -> {
            bankRepository.delete(bank);
            return true;
        }).orElse(false);
    }
}
