package com.project.payflow.service;

import com.project.payflow.entities.*;
import com.project.payflow.repository.NotificationRepository;
import com.project.payflow.repository.PaymentReminderRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentReminderService {

    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentReminderRepository paymentReminderRepository;
    private final BalanceService balanceService;

    public PaymentReminderService(TransactionRepository transactionRepository,
                                  NotificationRepository notificationRepository,
                                  PaymentReminderRepository paymentReminderRepository,
                                  BalanceService balanceService) {
        this.transactionRepository = transactionRepository;
        this.notificationRepository = notificationRepository;
        this.paymentReminderRepository = paymentReminderRepository;
        this.balanceService = balanceService;
    }

    @Transactional
    public void generateDailyRemindersForMerchant(Merchant merchant) {
        Long merchantId = merchant.getId();
        LocalDate today = LocalDate.now();

        // J : échéance aujourd’hui → DUE_SOON
        handleLevel(merchant, today, 1, "DUE_SOON");

        // J+3 : en retard de 3 jours → OVERDUE
        handleLevel(merchant, today.minusDays(3), 2, "OVERDUE");

        // J+7 : en retard de 7 jours → OVERDUE
        handleLevel(merchant, today.minusDays(7), 3, "OVERDUE");
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