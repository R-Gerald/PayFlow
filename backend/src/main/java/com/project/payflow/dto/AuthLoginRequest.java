package com.project.payflow.dto;

public class AuthLoginRequest {
    private String phone;
    private String password;

    public String getPhone() { return phone; }
    public AuthLoginRequest setPhone(String phone) { this.phone = phone; return this; }

    public String getPassword() { return password; }
    public AuthLoginRequest setPassword(String password) { this.password = password; return this; }
}