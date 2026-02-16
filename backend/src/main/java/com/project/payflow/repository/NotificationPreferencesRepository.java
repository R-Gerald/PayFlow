// src/main/java/com/project/payflow/repository/NotificationPreferencesRepository.java
package com.project.payflow.repository;

import com.project.payflow.entities.NotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, Long> {

    Optional<NotificationPreferences> findByMerchantIdAndCustomerId(Long merchantId, Long customerId);
}