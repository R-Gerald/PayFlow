// src/main/java/com/project/payflow/controller/StatsController.java
package com.project.payflow.controller;

import com.project.payflow.dto.StatsDto;
import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.TransactionType;
import com.project.payflow.repository.CustomerRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.project.payflow.entities.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
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
public StatsDto getStats(@RequestParam(required = false) String from,
                         @RequestParam(required = false) String to) {
    Long merchantId = getCurrentMerchantId();

    LocalDate fromDate = (from != null && !from.isBlank()) ? LocalDate.parse(from) : null;
    LocalDate toDate = (to != null && !to.isBlank()) ? LocalDate.parse(to) : null;

    // 1) Récupérer les transactions de la période (réutilisons les méthodes Spring Data)
    List<Transaction> transactions;

    if (fromDate != null && toDate != null) {
        transactions = transactionRepository.findByMerchantIdAndTransactionDateBetween(
                merchantId, fromDate, toDate
        );
    } else if (fromDate != null) {
        transactions = transactionRepository.findByMerchantIdAndTransactionDateGreaterThanEqual(
                merchantId, fromDate
        );
    } else if (toDate != null) {
        transactions = transactionRepository.findByMerchantIdAndTransactionDateLessThanEqual(
                merchantId, toDate
        );
    } else {
        transactions = transactionRepository.findByMerchantId(merchantId);
    }

    // 2) Calculer totals à partir de cette liste
    BigDecimal totalCredits = transactions.stream()
            .filter(t -> t.getType() == TransactionType.CREDIT)
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalPayments = transactions.stream()
            .filter(t -> t.getType() == TransactionType.PAYMENT)
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    // 3) Soldes par client (mêmes transactions filtrées)
    Map<Long, BigDecimal> balances = new HashMap<>();
    for (Transaction t : transactions) {
        Long customerId = t.getCustomer().getId();
        BigDecimal current = balances.getOrDefault(customerId, BigDecimal.ZERO);
        if (t.getType() == TransactionType.CREDIT) {
            current = current.add(t.getAmount());
        } else if (t.getType() == TransactionType.PAYMENT) {
            current = current.subtract(t.getAmount());
        }
        balances.put(customerId, current);
    }

    long clientsTotal = customerRepository.countByMerchantId(merchantId); // total clients du merchant
    long clientsWithDebt = balances.values().stream()
            .filter(b -> b != null && b.compareTo(BigDecimal.ZERO) > 0)
            .count();

    BigDecimal totalDue = balances.values().stream()
            .filter(b -> b != null && b.compareTo(BigDecimal.ZERO) > 0)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    return new StatsDto(totalDue, totalPayments, clientsWithDebt, clientsTotal);
}
}