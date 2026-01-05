package com.project.payflow.controller;

import com.project.payflow.entities.*;
import com.project.payflow.repository.CustomerRepository;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.repository.TransactionRepository;
import com.project.payflow.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/merchants/{merchantId}/transactions")
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

    //Liste des transactions d'un merchant (tous clients)
    @GetMapping
    public List<TransactionDto> list(@PathVariable Long merchantId) {
        return transactionRepository.findByMerchantId(merchantId)
                .stream()
                .map(TransactionDto::fromEntity)
                .toList();
    }

    //Créer une transaction
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionDto create(@PathVariable Long merchantId,
                                 @RequestBody CreateTransactionRequest request) {

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