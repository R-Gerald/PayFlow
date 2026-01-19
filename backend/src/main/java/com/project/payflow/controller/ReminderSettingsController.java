// src/main/java/com/project/payflow/controller/ReminderSettingsController.java
package com.project.payflow.controller;

import com.project.payflow.dto.ReminderSettingsDto;
import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.ReminderSettings;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.service.ReminderSettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/me/reminder-settings")
public class ReminderSettingsController {

    private final ReminderSettingsService reminderSettingsService;
    private final MerchantRepository merchantRepository;

    public ReminderSettingsController(ReminderSettingsService reminderSettingsService,
                                      MerchantRepository merchantRepository) {
        this.reminderSettingsService = reminderSettingsService;
        this.merchantRepository = merchantRepository;
    }

    private Merchant getCurrentMerchant() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Merchant m)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return merchantRepository.findById(m.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found"));
    }

    @GetMapping
    public ReminderSettingsDto getSettings() {
        Merchant merchant = getCurrentMerchant();
        ReminderSettings rs = reminderSettingsService.getOrCreateDefault(merchant);
        return ReminderSettingsDto.fromEntity(rs);
    }

    @PutMapping
    public ReminderSettingsDto updateSettings(@RequestBody ReminderSettingsDto dto) {
        Merchant merchant = getCurrentMerchant();
        ReminderSettings rs = reminderSettingsService.getOrCreateDefault(merchant);

        if (dto.getDueSoonDaysBefore() != null && dto.getDueSoonDaysBefore() >= 0) {
            rs.setDueSoonDaysBefore(dto.getDueSoonDaysBefore());
        }
        if (dto.getOverdueDays1() != null && dto.getOverdueDays1() >= 0) {
            rs.setOverdueDays1(dto.getOverdueDays1());
        }
        if (dto.getOverdueDays2() != null && dto.getOverdueDays2() >= 0) {
            rs.setOverdueDays2(dto.getOverdueDays2());
        }
        rs.setEnabled(dto.isEnabled());

        ReminderSettings saved = reminderSettingsService.save(rs);
        return ReminderSettingsDto.fromEntity(saved);
    }
}