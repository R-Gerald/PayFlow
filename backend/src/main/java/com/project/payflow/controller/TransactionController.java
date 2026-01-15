// src/main/java/com/project/payflow/controller/TransactionController.java
package com.project.payflow.controller;

import com.project.payflow.dto.CreateTransactionRequest;
import com.project.payflow.dto.TransactionDto;
import com.project.payflow.entities.Customer;
import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.Transaction;
import com.project.payflow.repository.CustomerRepository;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/me/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final MerchantRepository merchantRepository;
    private final CustomerRepository customerRepository;

    public TransactionController(TransactionRepository transactionRepository,
                                 MerchantRepository merchantRepository,
                                 CustomerRepository customerRepository) {
        this.transactionRepository = transactionRepository;
        this.merchantRepository = merchantRepository;
        this.customerRepository = customerRepository;
    }

    private Long getCurrentMerchantId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Merchant)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authenticated");
        }
        Merchant m = (Merchant) auth.getPrincipal();
        return m.getId();
    }

    // src/main/java/com/project/payflow/controller/TransactionController.java

@GetMapping
public List<TransactionDto> list(@RequestParam(required = false) String from,
                                 @RequestParam(required = false) String to) {
    Long merchantId = getCurrentMerchantId();

    LocalDate fromDate = (from != null && !from.isBlank()) ? LocalDate.parse(from) : null;
    LocalDate toDate = (to != null && !to.isBlank()) ? LocalDate.parse(to) : null;

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

    // Optionnel: trier ici si nécessaire
    transactions.sort((a, b) -> {
        int cmp = b.getTransactionDate().compareTo(a.getTransactionDate());
        if (cmp != 0) return cmp;
        return Long.compare(b.getId(), a.getId());
    });

    return transactions.stream()
            .map(TransactionDto::fromEntity)
            .toList();
}

    // Créer une transaction
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDto create(@RequestBody CreateTransactionRequest request) {
        Long merchantId = getCurrentMerchantId();

        if (request.getCustomerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "customerId is required");
        }
        if (request.getType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type is required");
        }
        if (request.getAmount() == null || request.getAmount().doubleValue() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount must be > 0");
        }

        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        // Vérifier que le customer appartient bien au merchant
        if (!customer.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer does not belong to merchant");
        }

        Transaction tx = new Transaction()
                .setMerchant(merchant)
                .setCustomer(customer)
                .setType(request.getType())
                .setAmount(request.getAmount())
                .setDescription(request.getDescription())
                .setTransactionDate(
                        request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now()
                )
                .setDueDate(request.getDueDate())
                .setPaymentMethod(request.getPaymentMethod());

        Transaction saved = transactionRepository.save(tx);
        return TransactionDto.fromEntity(saved);
    }
}