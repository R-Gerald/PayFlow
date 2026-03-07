// src/main/java/com/project/payflow/dto/NotificationPreferencesDto.java
package com.project.payflow.dto;

import com.project.payflow.entities.NotificationPreferences;

public class NotificationPreferencesDto {

    private String preferredChannel; // IN_APP, SMS, EMAIL, WHATSAPP
    private boolean allowInApp;
    private boolean allowSms;
    private boolean allowWhatsapp;
    private boolean allowEmail;

    public NotificationPreferencesDto() {}

    public NotificationPreferencesDto(String preferredChannel,
                                      boolean allowInApp,
                                      boolean allowSms,
                                      boolean allowWhatsapp,
                                      boolean allowEmail) {
        this.preferredChannel = preferredChannel;
        this.allowInApp = allowInApp;
        this.allowSms = allowSms;
        this.allowWhatsapp = allowWhatsapp;
        this.allowEmail = allowEmail;
    }

    public static NotificationPreferencesDto fromEntity(NotificationPreferences np) {
        return new NotificationPreferencesDto(
                np.getPreferredChannel(),
                np.isAllowInApp(),
                np.isAllowSms(),
                np.isAllowWhatsapp(),
                np.isAllowEmail()
        );
    }

    // getters/setters

    public String getPreferredChannel() { return preferredChannel; }
    public void setPreferredChannel(String preferredChannel) { this.preferredChannel = preferredChannel; }

    public boolean isAllowInApp() { return allowInApp; }
    public void setAllowInApp(boolean allowInApp) { this.allowInApp = allowInApp; }

    public boolean isAllowSms() { return allowSms; }
    public void setAllowSms(boolean allowSms) { this.allowSms = allowSms; }

    public boolean isAllowWhatsapp() { return allowWhatsapp; }
    public void setAllowWhatsapp(boolean allowWhatsapp) { this.allowWhatsapp = allowWhatsapp; }

    public boolean isAllowEmail() { return allowEmail; }
    public void setAllowEmail(boolean allowEmail) { this.allowEmail = allowEmail; }
}