package com.gnostica.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private Double amount;
    private String paymentMethod;
    private Integer status;
    private String transactionCode;
    private String accountNumber;
    private String senderBankId;
    private String senderAccountNumber;
    private String ref;
    
    @Column(columnDefinition = "JSONB")
    private String log;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    private Integer type; // 1: Nạp, 2: Thanh toán, 3: Rút
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "bank_id")
    private Bank bank;
}