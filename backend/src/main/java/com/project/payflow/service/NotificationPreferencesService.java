// src/main/java/com/project/payflow/service/NotificationPreferencesService.java
package com.project.payflow.service;

import com.project.payflow.entities.Customer;
import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.NotificationPreferences;
import com.project.payflow.repository.NotificationPreferencesRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationPreferencesService {

    private final NotificationPreferencesRepository repo;

    public NotificationPreferencesService(NotificationPreferencesRepository repo) {
        this.repo = repo;
    }

    public NotificationPreferences getOrCreateDefault(Merchant merchant, Customer customer) {
        return repo.findByMerchantIdAndCustomerId(merchant.getId(), customer.getId())
                .orElseGet(() -> {
                    NotificationPreferences np = new NotificationPreferences()
                            .setMerchant(merchant)
                            .setCustomer(customer)
                            .setPreferredChannel("IN_APP")
                            .setAllowInApp(true)
                            .setAllowSms(false)
                            .setAllowWhatsapp(false)
                            .setAllowEmail(false);
                    return repo.save(np);
                });
    }
}