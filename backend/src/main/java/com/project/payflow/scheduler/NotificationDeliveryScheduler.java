// src/main/java/com/project/payflow/scheduler/NotificationDeliveryScheduler.java
package com.project.payflow.scheduler;

import com.project.payflow.service.NotificationDeliveryService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationDeliveryScheduler {

    private final NotificationDeliveryService deliveryService;

    public NotificationDeliveryScheduler(NotificationDeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    // Toutes les minutes (pour test)
    @Scheduled(cron = "0 15 * * * *")
    public void processNotifications() {
        deliveryService.processPendingBatch();
    }
}