package com.project.payflow.service;

import com.project.payflow.entities.*;
import com.project.payflow.repository.NotificationRepository;
import com.project.payflow.repository.PaymentReminderRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.payflow.service.NotificationPreferencesService;
import com.project.payflow.repository.OutboundNotificationRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentReminderService {

   private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentReminderRepository paymentReminderRepository;
    private final BalanceService balanceService;
    private final ReminderSettingsService reminderSettingsService;
    private final OutboundNotificationRepository outboundNotificationRepository;
    private final NotificationPreferencesService notificationPreferencesService;

    public PaymentReminderService(TransactionRepository transactionRepository,
                                  NotificationRepository notificationRepository,
                                  PaymentReminderRepository paymentReminderRepository,
                                  BalanceService balanceService,
                                  ReminderSettingsService reminderSettingsService,
                                  OutboundNotificationRepository outboundNotificationRepository,
                                  NotificationPreferencesService notificationPreferencesService) {
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
        this.paymentReminderRepository = paymentReminderRepository;
        this.balanceService = balanceService;
        this.reminderSettingsService = reminderSettingsService;
        this.outboundNotificationRepository = outboundNotificationRepository;
        this.notificationPreferencesService = notificationPreferencesService;
    }
  @Transactional
    public void generateDailyRemindersForMerchant(Merchant merchant) {
        Long merchantId = merchant.getId();
        LocalDate today = LocalDate.now();

        // Lire (ou créer) les réglages du merchant
        var settings = reminderSettingsService.getOrCreateDefault(merchant);
        if (!settings.isEnabled()) {
            return; // rappels désactivés pour ce merchant
        }

        // 1) DUE_SOON : J - dueSoonDaysBefore
        int dueSoonBefore = settings.getDueSoonDaysBefore() != null
                ? settings.getDueSoonDaysBefore()
                : 0;
        LocalDate dueSoonTarget = today.plusDays(dueSoonBefore * 1L * -1); // J - N
        handleLevel(merchant, dueSoonTarget, 1, "DUE_SOON");

        // 2) OVERDUE niveaux
        Integer od1 = settings.getOverdueDays1();
        if (od1 != null && od1 > 0) {
            LocalDate target1 = today.minusDays(od1.longValue());
            handleLevel(merchant, target1, 2, "OVERDUE");
        }

        Integer od2 = settings.getOverdueDays2();
        if (od2 != null && od2 > 0) {
            LocalDate target2 = today.minusDays(od2.longValue());
            handleLevel(merchant, target2, 3, "OVERDUE");
        }
    }

    private void handleLevel(Merchant merchant,
                             LocalDate targetDueDate,
                             int level,
                             String type) {

        Long merchantId = merchant.getId();

        List<Transaction> credits =
                transactionRepository.findCreditsByMerchantAndDueDate(merchantId, targetDueDate);


        for (Transaction credit : credits) {
            Long customerId = credit.getCustomer().getId();
            LocalDate dueDate = credit.getDueDate();
            System.out.println("merchant id:"+credit.getMerchant().getId()+"id de transaction:"+credit.getId()+" montant: "+credit.getAmount());

            // 1) éviter les doublons
            boolean alreadySent = paymentReminderRepository
                    .existsByMerchantIdAndCustomerIdAndDueDateAndReminderLevel(
                            merchantId, customerId, dueDate, level);
            if (alreadySent) continue;

            // 2) vérifier que le client a encore une dette > 0
            BigDecimal balance = balanceService.getCustomerBalance(merchantId, customerId);
System.out.println("Balance client " + customerId + " = " + balance);
            if (balance.compareTo(BigDecimal.ZERO) <= 0) continue;

            // 3) créer la notification
            Notification notif = new Notification()
                    .setMerchant(merchant)
                    .setCustomer(credit.getCustomer())
                    .setTitle(type.equals("DUE_SOON") ? "Paiement à échéance" : "Paiement en retard")
                    .setMessage(buildMessage(credit, type));
            notificationRepository.save(notif);

            NotificationPreferences prefs =
                    notificationPreferencesService.getOrCreateDefault(merchant, credit.getCustomer());

                    
                // Pour l’instant, on ne fait que IN_APP comme canal principal,
                // mais la structure permet d’ajouter SMS/EMAIL plus tard
                String channel = prefs.isAllowSms() ? "SMS" : "IN_APP";

                OutboundNotification out = new OutboundNotification()
                        .setMerchant(merchant)
                        .setCustomer(credit.getCustomer())
                        .setChannel(channel)
                        .setType("REMINDER")
                        .setTitle(notif.getTitle())
                        .setMessage(notif.getMessage())
                        .setStatus("PENDING");

                outboundNotificationRepository.save(out);

            // 4) enregistrer l’historique
            PaymentReminder reminder = new PaymentReminder()
                    .setMerchant(merchant)
                    .setCustomer(credit.getCustomer())
                    .setDueDate(dueDate)
                    .setReminderLevel(level)
                    .setReminderType(type);
            paymentReminderRepository.save(reminder);
        }
    }

    private String buildMessage(Transaction credit, String type) {
        String clientName = credit.getCustomer().getName();
        System.out.println("id du transaction de crédit : " + credit.getId());
        if ("DUE_SOON".equals(type)) {
            return "Le crédit de " + credit.getAmount() +
                   " pour le client " + clientName +
                   " arrive à échéance le " + credit.getDueDate() + ".";
        } else {
            return "Le crédit de " + credit.getAmount() +
                   " pour le client " + clientName +
                   " est en retard depuis le " + credit.getDueDate() + ".";
        }
    }
}