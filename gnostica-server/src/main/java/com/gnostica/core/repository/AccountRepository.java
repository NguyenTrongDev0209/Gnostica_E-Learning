package com.gnostica.core.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Account;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    Optional<Account> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Account a JOIN FETCH a.role WHERE a.email = :email")
    Optional<Account> findByEmailWithRole(@org.springframework.data.repository.query.Param("email") String email);

    boolean existsByEmail(String email);
    java.util.List<Account> findAllByCreatedAtAfter(java.time.LocalDateTime date);
    long countByRoleNameAndCreatedAtAfter(String roleName, java.time.LocalDateTime date);
    java.util.List<Account> findByRoleName(String roleName);
    Optional<Account> findByIdAndRoleName(UUID id, String roleName);
    java.util.List<Account> findByMetadataIsNotNull();
    Optional<Account> findByPhone(String phone);
}
