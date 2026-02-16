// src/main/java/com/project/payflow/repository/OutboundNotificationRepository.java
package com.project.payflow.repository;

import com.project.payflow.entities.OutboundNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutboundNotificationRepository extends JpaRepository<OutboundNotification, Long> {

    List<OutboundNotification> findTop100ByStatusOrderByCreatedAtAsc(String status);
}