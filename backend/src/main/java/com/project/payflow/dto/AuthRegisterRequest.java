package com.project.payflow.dto;

public class AuthRegisterRequest {
    private String name;
    private String phone;
    private String email;
    private String password;

    // getters/setters
    public String getName() { return name; }
    public AuthRegisterRequest setName(String name) { this.name = name; return this; }

    public String getPhone() { return phone; }
    public AuthRegisterRequest setPhone(String phone) { this.phone = phone; return this; }

    public String getEmail() { return email; }
    public AuthRegisterRequest setEmail(String email) { this.email = email; return this; }

    public String getPassword() { return password; }
    public AuthRegisterRequest setPassword(String password) { this.password = password; return this; }
}