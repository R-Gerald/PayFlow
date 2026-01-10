package com.project.payflow.dto;

public class AuthResponse {
    private Long merchantId;
    private String name;
    private String phone;
    private String token;

    public AuthResponse(Long merchantId, String name, String phone, String token) {
        this.merchantId = merchantId;
        this.name = name;
        this.phone = phone;
        this.token = token;
    }

    public Long getMerchantId() { return merchantId; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getToken() { return token; }
}