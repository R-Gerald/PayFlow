package com.project.payflow.repository;

import com.project.payflow.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByMerchantIdOrderByCreatedAtDesc(Long merchantId);

    List<Notification> findByMerchantIdAndReadFalseOrderByCreatedAtDesc(Long merchantId);
}