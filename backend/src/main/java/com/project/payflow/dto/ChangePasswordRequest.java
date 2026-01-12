// src/main/java/com/project/payflow/dto/ChangePasswordRequest.java
package com.project.payflow.dto;

public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;

    public String getCurrentPassword() { return currentPassword; }
    public ChangePasswordRequest setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
        return this;
    }

    public String getNewPassword() { return newPassword; }
    public ChangePasswordRequest setNewPassword(String newPassword) {
        this.newPassword = newPassword;
        return this;
    }
}