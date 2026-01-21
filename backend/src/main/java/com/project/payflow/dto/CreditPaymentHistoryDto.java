// src/main/java/com/project/payflow/dto/CreditPaymentHistoryDto.java
package com.project.payflow.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public class CreditPaymentHistoryDto {

    private Long paymentId;
    private BigDecimal amount;         // montant alloué sur ce crédit
    private LocalDate paymentDate;     // transaction_date du PAYMENT
    private String description;        // description du PAYMENT
    private String paymentMethod;      // moyen de paiement
    private OffsetDateTime createdAt;  // date enregistrement allocation/paiement

    public CreditPaymentHistoryDto(Long paymentId,
                                   BigDecimal amount,
                                   LocalDate paymentDate,
                                   String description,
                                   String paymentMethod,
                                   OffsetDateTime createdAt) {
        this.paymentId = paymentId;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.description = description;
        this.paymentMethod = paymentMethod;
        this.createdAt = createdAt;
    }

    public Long getPaymentId() { return paymentId; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public String getDescription() { return description; }
    public String getPaymentMethod() { return paymentMethod; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}