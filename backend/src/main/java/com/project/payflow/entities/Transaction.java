package com.project.payflow.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "transactions", schema = "payflow")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // CREDIT ou PAYMENT

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @Column(name = "created_at", updatable = false,insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at",insertable = false)
    private OffsetDateTime updatedAt;

    // Getters & setters

    public Long getId() {
        return id;
    }

    public Merchant getMerchant() {
        return merchant;
    }

    public Transaction setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public Customer getCustomer() {
        return customer;
    }

    public Transaction setCustomer(Customer customer) {
        this.customer = customer;
        return this;
    }

    public TransactionType getType() {
        return type;
    }

    public Transaction setType(TransactionType type) {
        this.type = type;
        return this;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Transaction setAmount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Transaction setDescription(String description) {
        this.description = description;
        return this;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public Transaction setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
        return this;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public Transaction setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        return this;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public Transaction setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
        return this;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}