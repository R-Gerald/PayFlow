// src/main/java/com/project/payflow/repository/ReminderSettingsRepository.java
package com.project.payflow.repository;

import com.project.payflow.entities.ReminderSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReminderSettingsRepository extends JpaRepository<ReminderSettings, Long> {
    Optional<ReminderSettings> findByMerchantId(Long merchantId);
}