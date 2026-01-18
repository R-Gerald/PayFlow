// src/main/java/com/project/payflow/service/CreditService.java
package com.project.payflow.service;

import com.project.payflow.dto.CreditWithRemainingDto;
import com.project.payflow.entities.Customer;
import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.PaymentAllocation;
import com.project.payflow.entities.Transaction;
import com.project.payflow.entities.TransactionType;
import com.project.payflow.repository.PaymentAllocationRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CreditService {

    private final TransactionRepository transactionRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;

    public CreditService(TransactionRepository transactionRepository,
                         PaymentAllocationRepository paymentAllocationRepository) {
        this.transactionRepository = transactionRepository;
        this.paymentAllocationRepository = paymentAllocationRepository;
    }

    /**
     * Retourne la liste des crédits d'un client, avec le montant restant dû
     * (montant initial - allocations).
     */
   public List<CreditWithRemainingDto> getCreditsWithRemaining(Merchant merchant, Customer customer) {
    Long merchantId = merchant.getId();
    Long customerId = customer.getId();

    // 1) Récupérer tous les crédits de ce client
    List<Transaction> credits =
            transactionRepository.findCreditsByMerchantAndCustomer(merchantId, customerId);

    // 2) Pour chaque crédit, calculer le restant dû
    return credits.stream()
            .map(credit -> {
                List<PaymentAllocation> allocations =
                        paymentAllocationRepository.findByCredit(credit);

                BigDecimal allocated = allocations.stream()
                        .map(PaymentAllocation::getAllocatedAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal remaining = credit.getAmount().subtract(allocated);

                // Ne pas renvoyer les crédits totalement remboursés
                if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
                    return null;
                }

                return new CreditWithRemainingDto(
                        credit.getId(),
                        customerId,
                        credit.getAmount(),
                        remaining,
                        credit.getDescription(),
                        credit.getTransactionDate(),
                        credit.getDueDate()
                );
            })
            .filter(dto -> dto != null)
            .toList();
}

    public BigDecimal getRemainingAmountForCredit(Transaction credit) {
        List<PaymentAllocation> allocations =
                paymentAllocationRepository.findByCredit(credit);

        BigDecimal allocated = allocations.stream()
                .map(PaymentAllocation::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return credit.getAmount().subtract(allocated);
    }
}