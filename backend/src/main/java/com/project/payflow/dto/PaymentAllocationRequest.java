// src/main/java/com/project/payflow/dto/PaymentAllocationRequest.java
package com.project.payflow.dto;

import java.math.BigDecimal;

public class PaymentAllocationRequest {

    private Long creditId;
    private BigDecimal amount;

    public Long getCreditId() {
        return creditId;
    }

    public PaymentAllocationRequest setCreditId(Long creditId) {
        this.creditId = creditId;
        return this;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public PaymentAllocationRequest setAmount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }
}