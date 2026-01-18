// src/main/java/com/project/payflow/dto/CreditWithRemainingDto.java
package com.project.payflow.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreditWithRemainingDto {

    private Long id;
    private Long customerId;
    private BigDecimal amount;          // montant initial du crédit
    private BigDecimal remainingAmount; // montant restant dû
    private String description;
    private LocalDate transactionDate;
    private LocalDate dueDate;

    public CreditWithRemainingDto(Long id,
                                  Long customerId,
                                  BigDecimal amount,
                                  BigDecimal remainingAmount,
                                  String description,
                                  LocalDate transactionDate,
                                  LocalDate dueDate) {
        this.id = id;
        this.customerId = customerId;
        this.amount = amount;
        this.remainingAmount = remainingAmount;
        this.description = description;
        this.transactionDate = transactionDate;
        this.dueDate = dueDate;
    }

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public String getDescription() { return description; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public LocalDate getDueDate() { return dueDate; }
}