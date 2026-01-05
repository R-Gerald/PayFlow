package com.project.payflow.controller;

import com.project.payflow.dto.StatsDto;
import com.project.payflow.repository.CustomerRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/merchants/{merchantId}/stats")
public class StatsController {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;

    public StatsController(TransactionRepository transactionRepository,
                           CustomerRepository customerRepository) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public StatsDto getStats(@PathVariable Long merchantId) {
        // Totaux global CREDIT/PAYMENT
        Object[] totalsRow = transactionRepository.findTotalsByMerchant(merchantId);
        BigDecimal totalCredits = totalsRow != null && totalsRow[0] != null ? (BigDecimal) totalsRow[0] : BigDecimal.ZERO;
        BigDecimal totalPayments = totalsRow != null && totalsRow[1] != null ? (BigDecimal) totalsRow[1] : BigDecimal.ZERO;

        // Soldes par client
        Map<Long, BigDecimal> balances = new HashMap<>();
        for (Object[] row : transactionRepository.findClientBalancesByMerchant(merchantId)) {
            Long customerId = (Long) row[0];
            BigDecimal balance = (BigDecimal) row[1];
            balances.put(customerId, balance);
        }

        long clientsTotal = customerRepository.countByMerchantId(merchantId);
        long clientsWithDebt = balances.values().stream()
                .filter(b -> b != null && b.compareTo(BigDecimal.ZERO) > 0)
                .count();

        // totalDue global = somme des balances > 0
        BigDecimal totalDue = balances.values().stream()
                .filter(b -> b != null && b.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new StatsDto(totalDue, totalPayments, clientsWithDebt, clientsTotal);
    }
}