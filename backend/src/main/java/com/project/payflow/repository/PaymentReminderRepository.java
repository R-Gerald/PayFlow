package com.project.payflow.repository;

import com.project.payflow.entities.PaymentReminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface PaymentReminderRepository extends JpaRepository<PaymentReminder, Long> {

    boolean existsByMerchantIdAndCustomerIdAndDueDateAndReminderLevel(
            Long merchantId,
            Long customerId,
            LocalDate dueDate,
            Integer reminderLevel
    );
}