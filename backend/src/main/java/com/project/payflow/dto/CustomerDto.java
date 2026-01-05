// src/main/java/com/project/payflow/dto/CustomerDto.java
package com.project.payflow.dto;

import com.project.payflow.entities.Customer;

import java.math.BigDecimal;

public class CustomerDto {

    private Long id;
    private String name;
    private String phone;
    private String notes;
    private BigDecimal totalDue; // nouveau champ

    public CustomerDto() {}

    public CustomerDto(Long id, String name, String phone, String notes, BigDecimal totalDue) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.notes = notes;
        this.totalDue = totalDue;
    }

    public static CustomerDto fromEntity(Customer c, BigDecimal totalDue) {
        return new CustomerDto(
                c.getId(),
                c.getName(),
                c.getPhone(),
                c.getNotes(),
                totalDue != null ? totalDue : BigDecimal.ZERO
        );
    }

    // getters

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getNotes() {
        return notes;
    }

    public BigDecimal getTotalDue() {
        return totalDue;
    }
}