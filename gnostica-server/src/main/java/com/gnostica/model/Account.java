package com.gnostica.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "accounts")
public class Account {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	public Integer id;
	
	@Column(columnDefinition = "nvarchar(255)")
	public String fullName;
	
	@Column(columnDefinition = "varchar(255)", unique = true)
	public String email;
	
	@Column(columnDefinition = "varchar(12)")
	public String phone;
	
	@Column(columnDefinition = "varchar(255)", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
	public String password;
	
	@Column(columnDefinition = "varchar(255)")
	public String provider;
	
	@Column
	private Boolean active = false; // Mặc định là false để đợi xác thực
	
	@Column(length = 6)
	private String verificationCode;
	
	@Column
	private java.time.LocalDateTime verificationExpiry;
	
	@ManyToOne
	@JoinColumn(name = "role_id")
	Role role;
}
