package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.SystemConfig;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Integer> {
    Optional<SystemConfig> findByConfigKey(String configKey);

    List<SystemConfig> findByConfigKeyIn(Collection<String> configKeys);
}

