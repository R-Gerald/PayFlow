package com.project.payflow.dto;

public class CreateMerchantRequest {

    private String name;
    private String phone;
    private String email;
    private String password; // on simplifie : on reçoit le mot de passe brut pour le test

    public String getName() {
        return name;
    }

    public CreateMerchantRequest setName(String name) {
        this.name = name;
        return this;
    }

    public String getPhone() {
        return phone;
    }

    public CreateMerchantRequest setPhone(String phone) {
        this.phone = phone;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public CreateMerchantRequest setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getPassword() {
        return password;
    }

    public CreateMerchantRequest setPassword(String password) {
        this.password = password;
        return this;
    }
}