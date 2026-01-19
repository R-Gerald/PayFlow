// src/main/java/com/project/payflow/service/ReminderSettingsService.java
package com.project.payflow.service;

import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.ReminderSettings;
import com.project.payflow.repository.ReminderSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class ReminderSettingsService {

    private final ReminderSettingsRepository reminderSettingsRepository;

    public ReminderSettingsService(ReminderSettingsRepository reminderSettingsRepository) {
        this.reminderSettingsRepository = reminderSettingsRepository;
    }

    public ReminderSettings getOrCreateDefault(Merchant merchant) {
        return reminderSettingsRepository.findByMerchantId(merchant.getId())
                .orElseGet(() -> {
                    ReminderSettings rs = new ReminderSettings()
                            .setMerchant(merchant)
                            .setDueSoonDaysBefore(0)  // J
                            .setOverdueDays1(3)       // J+3
                            .setOverdueDays2(7)       // J+7
                            .setEnabled(true);
                    return reminderSettingsRepository.save(rs);
                });
    }

    public ReminderSettings save(ReminderSettings settings) {
        return reminderSettingsRepository.save(settings);
    }
}