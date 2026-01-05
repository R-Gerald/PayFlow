package com.project.payflow.dto;

public class CreateCustomerRequest {

    private String name;
    private String phone;
    private String notes;

    public String getName() {
        return name;
    }

    public CreateCustomerRequest setName(String name) {
        this.name = name;
        return this;
    }

    public String getPhone() {
        return phone;
    }

    public CreateCustomerRequest setPhone(String phone) {
        this.phone = phone;
        return this;
    }

    public String getNotes() {
        return notes;
    }

    public CreateCustomerRequest setNotes(String notes) {
        this.notes = notes;
        return this;
    }
}