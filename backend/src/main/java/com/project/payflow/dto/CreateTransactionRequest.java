package com.project.payflow.dto;

import com.project.payflow.entities.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateTransactionRequest {

    private Long customerId;
    private TransactionType type;   // CREDIT ou PAYMENT
    private BigDecimal amount;
    private String description;
    private LocalDate transactionDate;
    private LocalDate dueDate;
    private String paymentMethod;

    public Long getCustomerId() {
        return customerId;
    }

    public CreateTransactionRequest setCustomerId(Long customerId) {
        this.customerId = customerId;
        return this;
    }

    public TransactionType getType() {
        return type;
    }

    public CreateTransactionRequest setType(TransactionType type) {
        this.type = type;
        return this;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public CreateTransactionRequest setAmount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CreateTransactionRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public CreateTransactionRequest setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
        return this;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public CreateTransactionRequest setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        return this;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public CreateTransactionRequest setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
        return this;
    }
}