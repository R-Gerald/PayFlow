package com.project.payflow.dto;

import com.project.payflow.entities.Notification;

import java.time.OffsetDateTime;

public class NotificationDto {

    private Long id;
    private Long customerId;
    private String title;
    private String message;
    private boolean read;
    private OffsetDateTime createdAt;

    public NotificationDto(Long id, Long customerId, String title,
                           String message, boolean read, OffsetDateTime createdAt) {
        this.id = id;
        this.customerId = customerId;
        this.title = title;
        this.message = message;
        this.read = read;
        this.createdAt = createdAt;
    }

    public static NotificationDto fromEntity(Notification n) {
        return new NotificationDto(
                n.getId(),
                n.getCustomer() != null ? n.getCustomer().getId() : null,
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}