// src/main/java/com/project/payflow/entities/ReminderSettings.java
package com.project.payflow.entities;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "reminder_settings", schema = "payflow")
public class ReminderSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false, unique = true)
    private Merchant merchant;

    @Column(name = "due_soon_days_before", nullable = false)
    private Integer dueSoonDaysBefore = 0;

    @Column(name = "overdue_days_1", nullable = false)
    private Integer overdueDays1 = 3;

    @Column(name = "overdue_days_2", nullable = false)
    private Integer overdueDays2 = 7;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "created_at", updatable = false, insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false)
    private OffsetDateTime updatedAt;

    // Getters / setters

    public Long getId() {
        return id;
    }

    public Merchant getMerchant() {
        return merchant;
    }

    public ReminderSettings setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public Integer getDueSoonDaysBefore() {
        return dueSoonDaysBefore;
    }

    public ReminderSettings setDueSoonDaysBefore(Integer dueSoonDaysBefore) {
        this.dueSoonDaysBefore = dueSoonDaysBefore;
        return this;
    }

    public Integer getOverdueDays1() {
        return overdueDays1;
    }

    public ReminderSettings setOverdueDays1(Integer overdueDays1) {
        this.overdueDays1 = overdueDays1;
        return this;
    }

    public Integer getOverdueDays2() {
        return overdueDays2;
    }

    public ReminderSettings setOverdueDays2(Integer overdueDays2) {
        this.overdueDays2 = overdueDays2;
        return this;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public ReminderSettings setEnabled(boolean enabled) {
        this.enabled = enabled;
        return this;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}