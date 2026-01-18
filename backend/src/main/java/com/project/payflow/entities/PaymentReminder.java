package com.project.payflow.entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(
    name = "payment_reminders",
    schema = "payflow",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"merchant_id", "customer_id", "due_date", "reminder_level"}
    )
)
public class PaymentReminder {

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

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    // 1 = J, 2 = J+3, 3 = J+7
    @Column(name = "reminder_level", nullable = false)
    private Integer reminderLevel;

    // DUE_SOON, OVERDUE
    @Column(name = "reminder_type", nullable = false, length = 20)
    private String reminderType;

    @Column(name = "sent_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime sentAt;

    // Getters / setters

    public Long getId() {
        return id;
    }

    public Merchant getMerchant() {
        return merchant;
    }

    public PaymentReminder setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public Customer getCustomer() {
        return customer;
    }

    public PaymentReminder setCustomer(Customer customer) {
        this.customer = customer;
        return this;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public PaymentReminder setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        return this;
    }

    public Integer getReminderLevel() {
        return reminderLevel;
    }

    public PaymentReminder setReminderLevel(Integer reminderLevel) {
        this.reminderLevel = reminderLevel;
        return this;
    }

    public String getReminderType() {
        return reminderType;
    }

    public PaymentReminder setReminderType(String reminderType) {
        this.reminderType = reminderType;
        return this;
    }

    public OffsetDateTime getSentAt() {
        return sentAt;
    }
}