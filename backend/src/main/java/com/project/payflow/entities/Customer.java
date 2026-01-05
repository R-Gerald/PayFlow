package com.project.payflow.entities;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers", schema = "payflow")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(length = 50)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false,insertable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at",insertable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions = new ArrayList<>();

    // Getters & setters

    public Long getId() {
        return id;
    }

    public Merchant getMerchant() {
        return merchant;
    }

    public Customer setMerchant(Merchant merchant) {
        this.merchant = merchant;
        return this;
    }

    public String getName() {
        return name;
    }

    public Customer setName(String name) {
        this.name = name;
        return this;
    }

    public String getPhone() {
        return phone;
    }

    public Customer setPhone(String phone) {
        this.phone = phone;
        return this;
    }

    public String getNotes() {
        return notes;
    }

    public Customer setNotes(String notes) {
        this.notes = notes;
        return this;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }
}