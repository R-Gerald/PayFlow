package com.project.payflow.dto;

import com.project.payflow.entities.*;


import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionDto {

    private Long id;
    private Long customerId;
    private TransactionType type;
    private BigDecimal amount;
    private String description;
    private LocalDate transactionDate;
    private LocalDate dueDate;
    private String paymentMethod;
    private BigDecimal interestRate;
    private BigDecimal latePenalty;

    public TransactionDto() {}

    public TransactionDto(Long id,
                          Long customerId,
                          TransactionType type,
                          BigDecimal amount,
                          String description,
                          LocalDate transactionDate,
                          LocalDate dueDate,
                          String paymentMethod,
                        BigDecimal interestRate,
                        BigDecimal latePenalty) {
        this.id = id;
        this.customerId = customerId;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.transactionDate = transactionDate;
        this.dueDate = dueDate;
        this.paymentMethod = paymentMethod;
        this.interestRate = interestRate;
        this.latePenalty = latePenalty;
    }

    public static TransactionDto fromEntity(Transaction t) {
        return new TransactionDto(
                t.getId(),
                t.getCustomer().getId(),
                t.getType(),
                t.getAmount(),
                t.getDescription(),
                t.getTransactionDate(),
                t.getDueDate(),
                t.getPaymentMethod(),
                t.getInterestRate(),
                t.getLatePenalty()
        );
    }

    // getters seulement (facultatif de mettre des setters)

    public BigDecimal getInterestRate() {
        return interestRate;
    }
    public BigDecimal getLatePenalty() {
        return latePenalty;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public TransactionType getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }
}