package com.project.payflow.dto;

import java.math.BigDecimal;

public class StatsDto {

    private BigDecimal totalDue;
    private BigDecimal totalPayments;
    private long clientsWithDebt;
    private long clientsTotal;

    public StatsDto(BigDecimal totalDue, BigDecimal totalPayments, long clientsWithDebt, long clientsTotal) {
        this.totalDue = totalDue != null ? totalDue : BigDecimal.ZERO;
        this.totalPayments = totalPayments != null ? totalPayments : BigDecimal.ZERO;
        this.clientsWithDebt = clientsWithDebt;
        this.clientsTotal = clientsTotal;
    }

    public BigDecimal getTotalDue() {
        return totalDue;
    }

    public BigDecimal getTotalPayments() {
        return totalPayments;
    }

    public long getClientsWithDebt() {
        return clientsWithDebt;
    }

    public long getClientsTotal() {
        return clientsTotal;
    }
}