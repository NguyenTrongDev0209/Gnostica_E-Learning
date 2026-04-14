package com.gnostica.model;

import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
	
	public String fullName;
	
	@Column(columnDefinition = "varchar(255)", unique = true)
	public String email;
	
	@Column(columnDefinition = "varchar(12)")
	public String phone;
	
	@Column(columnDefinition = "varchar(255)")
	public String provider;

	@Column(columnDefinition = "varchar(255)")
	private String avatar;
	
	@Column(name = "birth_day")
    private LocalDate birthDay;
	
	@Column
	private Boolean active = false; // Mặc định là false để đợi xác thực

	@Column
	private Boolean locked = false; // Mặc định là không khóa

	@Column(columnDefinition = "TEXT")
	private String lockReason;
	
	@Column(length = 6)
	private String verificationCode;
	
	@Column
	private LocalDateTime verificationExpiry;
	
	@ManyToOne
	@JoinColumn(name = "role_id")
	Role role;

	@OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<Password> passwords;

	public String getPassword() {
		if (passwords == null) return null;
		return passwords.stream()
				.filter(p -> p.getStatus() == 1)
				.map(Password::getPassword)
				.findFirst()
				.orElse(null);
	}
}
