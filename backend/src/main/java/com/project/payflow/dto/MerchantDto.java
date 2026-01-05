package com.project.payflow.dto;

import com.project.payflow.entities.*;

public class MerchantDto {

    private Long id;
    private String name;
    private String phone;
    private String email;

    public MerchantDto() {}

    public MerchantDto(Long id, String name, String phone, String email) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
    }

    public static MerchantDto fromEntity(Merchant m) {
        return new MerchantDto(
                m.getId(),
                m.getName(),
                m.getPhone(),
                m.getEmail()
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

    public String getEmail() {
        return email;
    }
}