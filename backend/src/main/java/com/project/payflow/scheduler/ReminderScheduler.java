package com.project.payflow.scheduler;

import com.project.payflow.entities.Merchant;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.service.PaymentReminderService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReminderScheduler {

    private final MerchantRepository merchantRepository;
    private final PaymentReminderService paymentReminderService;

    public ReminderScheduler(MerchantRepository merchantRepository,
                             PaymentReminderService paymentReminderService) {
        this.merchantRepository = merchantRepository;
        this.paymentReminderService = paymentReminderService;
    }

    // Tous les jours à 08:00
   @Scheduled(cron = "0 0 8 * * *")
    public void generateDailyReminders() {
        List<Merchant> merchants = merchantRepository.findAll();
        for (Merchant m : merchants) {
            paymentReminderService.generateDailyRemindersForMerchant(m);
        }
    }
}