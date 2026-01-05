package com.project.payflow.dto;

import com.project.payflow.entities.*;

public class CustomerDto {

    private Long id;
    private String name;
    private String phone;
    private String notes;

    public CustomerDto() {}

    public CustomerDto(Long id, String name, String phone, String notes) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.notes = notes;
    }

    public static CustomerDto fromEntity(Customer c) {
        return new CustomerDto(
                c.getId(),
                c.getName(),
                c.getPhone(),
                c.getNotes()
        );
    }

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
}