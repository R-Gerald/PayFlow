// src/main/java/com/project/payflow/dto/UpdateCustomerRequest.java
package com.project.payflow.dto;

public class UpdateCustomerRequest {
    private String name;
    private String phone;
    private String notes;

    public String getName() { return name; }
    public UpdateCustomerRequest setName(String name) { this.name = name; return this; }

    public String getPhone() { return phone; }
    public UpdateCustomerRequest setPhone(String phone) { this.phone = phone; return this; }

    public String getNotes() { return notes; }
    public UpdateCustomerRequest setNotes(String notes) { this.notes = notes; return this; }
}