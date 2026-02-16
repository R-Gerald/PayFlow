// src/main/java/com/project/payflow/entities/OutboundNotification.java
package com.project.payflow.entities;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "outbound_notifications", schema = "payflow")
public class OutboundNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Merchant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    // Customer (peut être null)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(nullable = false, length = 20)
    private String channel; // IN_APP, SMS, EMAIL, WHATSAPP

    @Column(nullable = false, length = 50)
    private String type;    // REMINDER, INFO, etc.

    @Column(length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, SENT, FAILED, CANCELLED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false)
    private OffsetDateTime updatedAt;

    // Getters / setters

    public Long getId() { return id; }

    public Merchant getMerchant() { return merchant; }
    public OutboundNotification setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public Customer getCustomer() { return customer; }
    public OutboundNotification setCustomer(Customer customer) {
        this.customer = customer;
        return this;
    }

    public String getChannel() { return channel; }
    public OutboundNotification setChannel(String channel) {
        this.channel = channel;
        return this;
    }

    public String getType() { return type; }
    public OutboundNotification setType(String type) {
        this.type = type;
        return this;
    }

    public String getTitle() { return title; }
    public OutboundNotification setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getMessage() { return message; }
    public OutboundNotification setMessage(String message) {
        this.message = message;
        return this;
    }

    public String getStatus() { return status; }
    public OutboundNotification setStatus(String status) {
        this.status = status;
        return this;
    }

    public String getErrorMessage() { return errorMessage; }
    public OutboundNotification setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
        return this;
    }

    public OffsetDateTime getSentAt() { return sentAt; }
    public OutboundNotification setSentAt(OffsetDateTime sentAt) {
        this.sentAt = sentAt;
        return this;
    }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}