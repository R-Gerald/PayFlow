package com.project.payflow.entities;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notification_preferences", schema = "payflow",
       uniqueConstraints = @UniqueConstraint(columnNames = {"merchant_id", "customer_id"}))
public class NotificationPreferences {

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

    @Column(name = "preferred_channel", nullable = false, length = 20)
    private String preferredChannel = "IN_APP"; // IN_APP, SMS, WHATSAPP, EMAIL

    @Column(name = "allow_in_app", nullable = false)
    private boolean allowInApp = true;

    @Column(name = "allow_sms", nullable = false)
    private boolean allowSms = false;

    @Column(name = "allow_whatsapp", nullable = false)
    private boolean allowWhatsapp = false;

    @Column(name = "allow_email", nullable = false)
    private boolean allowEmail = false;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false)
    private OffsetDateTime updatedAt;

    // Getters / setters

    public Long getId() { return id; }

    public Merchant getMerchant() { return merchant; }
    public NotificationPreferences setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public Customer getCustomer() { return customer; }
    public NotificationPreferences setCustomer(Customer customer) {
        this.customer = customer;
        return this;
    }

    public String getPreferredChannel() { return preferredChannel; }
    public NotificationPreferences setPreferredChannel(String preferredChannel) {
        this.preferredChannel = preferredChannel;
        return this;
    }

    public boolean isAllowInApp() { return allowInApp; }
    public NotificationPreferences setAllowInApp(boolean allowInApp) {
        this.allowInApp = allowInApp;
        return this;
    }

    public boolean isAllowSms() { return allowSms; }
    public NotificationPreferences setAllowSms(boolean allowSms) {
        this.allowSms = allowSms;
        return this;
    }

    public boolean isAllowWhatsapp() { return allowWhatsapp; }
    public NotificationPreferences setAllowWhatsapp(boolean allowWhatsapp) {
        this.allowWhatsapp = allowWhatsapp;
        return this;
    }

    public boolean isAllowEmail() { return allowEmail; }
    public NotificationPreferences setAllowEmail(boolean allowEmail) {
        this.allowEmail = allowEmail;
        return this;
    }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}