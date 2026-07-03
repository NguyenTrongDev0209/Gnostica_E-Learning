package com.gnostica.core.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "instructors")
public class Instructor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name", columnDefinition = "varchar(255)")
    private String fullName;

    @Column(length = 255)
    private String email;
 
    @Column(length = 20)
    private String phone;

    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "id", unique = true)
    private Account account;

    @Column(columnDefinition = "text")
    private String bio;

    @Column
    private Integer status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column
    private Boolean ticked;
}
