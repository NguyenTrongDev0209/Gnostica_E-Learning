package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.util.UUID;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "account_banks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"account_id", "bank_id", "account_number"})
})
public class AccountBank {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", updatable = false)
    private Account account;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", updatable = false)
    private Bank bank;

    @NotBlank
    @Size(max = 255)
    @JsonIgnore
    private String accountNumber;

    @Size(max = 255)
    @JsonIgnore
    private String pin;

    /**
     * Tên chủ tài khoản ngân hàng (xác minh qua BankLookup khi lưu tài khoản).
     */
    @Size(max = 255)
    private String name;

    /**
     * Status: 0: Inactive (Ngừng dùng), 1: Active (Đang sử dụng)
     */
    @NotNull
    private Integer status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

}
