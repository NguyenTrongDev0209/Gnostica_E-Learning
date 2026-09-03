package com.gnostica.core.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.gnostica.core.model.Account;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from Account a where a.id = :id")
    Optional<Account> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);
    Optional<Account> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM Account a JOIN FETCH a.role WHERE a.email = :email")
    Optional<Account> findByEmailWithRole(@org.springframework.data.repository.query.Param("email") String email);

    boolean existsByEmail(String email);
    java.util.List<Account> findAllByCreatedAtAfter(java.time.LocalDateTime date);
    java.util.List<Account> findAllByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    long countByRoleNameAndCreatedAtAfter(String roleName, java.time.LocalDateTime date);
    long countByRoleNameAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(String roleName, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Account a WHERE UPPER(a.role.name) = UPPER(:roleName) AND a.deletedAt IS NULL")
    long countByRoleNameIgnoreCaseAndDeletedAtIsNull(@org.springframework.data.repository.query.Param("roleName") String roleName);

    java.util.List<Account> findByRoleName(String roleName);
    java.util.List<Account> findByRoleNameIgnoreCaseAndBirthDayIsNotNullAndDeletedAtIsNull(String roleName);
    Optional<Account> findByIdAndRoleName(UUID id, String roleName);
    java.util.List<Account> findByMetadataIsNotNull();
    Optional<Account> findByPhone(String phone);
    @org.springframework.data.jpa.repository.Query("SELECT a FROM Account a WHERE " +
            "(:isDummyRole = true OR a.role.name IN :roleNames) AND " +
            "(:hasSearchTerm = false OR LOWER(a.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(a.phone) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
            "(-1 IN :statuses OR a.status IN :statuses)")
    org.springframework.data.domain.Page<Account> searchAccounts(
            @org.springframework.data.repository.query.Param("isDummyRole") boolean isDummyRole,
            @org.springframework.data.repository.query.Param("roleNames") java.util.List<String> roleNames,
            @org.springframework.data.repository.query.Param("hasSearchTerm") boolean hasSearchTerm,
            @org.springframework.data.repository.query.Param("searchTerm") String searchTerm,
            @org.springframework.data.repository.query.Param("statuses") java.util.List<Integer> statuses,
            org.springframework.data.domain.Pageable pageable);

    long countByRoleNameIgnoreCaseAndStatus(String roleName, Integer status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Account a WHERE UPPER(a.role.name) = UPPER(:roleName) AND a.status = :status AND a.id != :id")
    long countByRoleNameIgnoreCaseAndStatusAndIdNot(@org.springframework.data.repository.query.Param("roleName") String roleName, @org.springframework.data.repository.query.Param("status") Integer status, @org.springframework.data.repository.query.Param("id") UUID id);

    org.springframework.data.domain.Page<Account> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(String email, String fullName, org.springframework.data.domain.Pageable pageable);
}
