package com.gnostica.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.gnostica.core.model.Device;

@Repository
public interface DeviceRepository extends JpaRepository<Device, java.util.UUID> {
}

