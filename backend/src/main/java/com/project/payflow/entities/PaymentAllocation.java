package com.project.payflow.entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payment_allocations", schema = "payflow")
public class PaymentAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Merchant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    // Customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Paiement (transaction type = PAYMENT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Transaction payment;

    // Crédit (transaction type = CREDIT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_id", nullable = false)
    private Transaction credit;

    @Column(name = "allocated_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal allocatedAmount;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    // Getters / setters

    public Long getId() {
        return id;
    }

    public Merchant getMerchant() {
        return merchant;
    }

    public PaymentAllocation setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public Customer getCustomer() {
        return customer;
    }

    public PaymentAllocation setCustomer(Customer customer) {
        this.customer = customer;
        return this;
    }

    public Transaction getPayment() {
        return payment;
    }

    public PaymentAllocation setPayment(Transaction payment) {
        this.payment = payment;
        return this;
    }

    public Transaction getCredit() {
        return credit;
    }

    public PaymentAllocation setCredit(Transaction credit) {
        this.credit = credit;
        return this;
    }

    public BigDecimal getAllocatedAmount() {
        return allocatedAmount;
    }

    public PaymentAllocation setAllocatedAmount(BigDecimal allocatedAmount) {
        this.allocatedAmount = allocatedAmount;
        return this;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}