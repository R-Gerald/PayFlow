package com.project.payflow.entities;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notifications", schema = "payflow")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Merchant propriétaire
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    // Client concerné (optionnel)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    // Getters / setters fluent

    public Long getId() {
        return id;
    }

    public Merchant getMerchant() {
        return merchant;
    }

    public Notification setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public Customer getCustomer() {
        return customer;
    }

    public Notification setCustomer(Customer customer) {
        this.customer = customer;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Notification setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getMessage() {
        return message;
    }

    public Notification setMessage(String message) {
        this.message = message;
        return this;
    }

    public boolean isRead() {
        return read;
    }

    public Notification setRead(boolean read) {
        this.read = read;
        return this;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}