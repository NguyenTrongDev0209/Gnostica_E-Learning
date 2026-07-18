package com.gnostica.core.config;
 
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
 
@Configuration
@Slf4j
public class DatabaseCleanupConfig {
 
    @Bean
    @Profile("cleanup") // Chỉ chạy khi bạn chạy với profile: --spring.profiles.active=cleanup
    public CommandLineRunner cleanupDatabase(EntityManager entityManager) {
        return args -> {
            truncateTable(entityManager);
        };
    }
 
    @Transactional
    public void truncateTable(EntityManager entityManager) {
        log.info("Bắt đầu xóa sạch dữ liệu bảng accounts (CASCADE)...");
        try {
            entityManager.createNativeQuery("TRUNCATE TABLE accounts RESTART IDENTITY CASCADE").executeUpdate();
            log.info("Đã xóa sạch bảng accounts và reset ID thành công!");
        } catch (Exception e) {
            log.error("Lỗi khi xóa bảng accounts: {}", e.getMessage());
        }
    }
}
