package com.project.payflow.service;

import com.project.payflow.entities.Transaction;
import com.project.payflow.entities.TransactionType;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BalanceService {

    private final TransactionRepository transactionRepository;

    public BalanceService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal getCustomerBalance(Long merchantId, Long customerId) {
        List<Transaction> txs = transactionRepository.findByMerchantIdAndCustomerId(merchantId, customerId);
        return txs.stream()
                .map(t -> {
                    if (t.getType() == TransactionType.CREDIT) {
                        return t.getAmount();
                    } else if (t.getType() == TransactionType.PAYMENT) {
                        return t.getAmount().negate();
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}