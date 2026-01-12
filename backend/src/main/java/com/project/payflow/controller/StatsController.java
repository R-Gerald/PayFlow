// src/main/java/com/project/payflow/controller/StatsController.java
package com.project.payflow.controller;

import com.project.payflow.dto.StatsDto;
import com.project.payflow.entities.Merchant;
import com.project.payflow.repository.CustomerRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/me")
public class StatsController {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;

    public StatsController(TransactionRepository transactionRepository,
                           CustomerRepository customerRepository) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
    }

    private Long getCurrentMerchantId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Merchant)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        Merchant m = (Merchant) auth.getPrincipal();
        return m.getId();
    }

    // src/main/java/com/project/payflow/controller/StatsController.java

@GetMapping("/stats")
public StatsDto getStats() {
    Long merchantId = getCurrentMerchantId();

    // Totaux globaux
    java.util.List<Object[]> rows = transactionRepository.findTotalsByMerchant(merchantId);
    Object[] totalsRow = (rows != null && !rows.isEmpty()) ? rows.get(0) : null;

    BigDecimal totalCredits = BigDecimal.ZERO;
    BigDecimal totalPayments = BigDecimal.ZERO;

    if (totalsRow != null) {
        if (totalsRow.length > 0 && totalsRow[0] != null) {
            totalCredits = (BigDecimal) totalsRow[0];
        }
        if (totalsRow.length > 1 && totalsRow[1] != null) {
            totalPayments = (BigDecimal) totalsRow[1];
        }
    }

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

    BigDecimal totalDue = balances.values().stream()
            .filter(b -> b != null && b.compareTo(BigDecimal.ZERO) > 0)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    System.out.println("TotalsRow = " + java.util.Arrays.toString(totalsRow));
    System.out.println("totalCredits = " + totalCredits + ", totalPayments = " + totalPayments);

    return new StatsDto(totalDue, totalPayments, clientsWithDebt, clientsTotal);
}
}