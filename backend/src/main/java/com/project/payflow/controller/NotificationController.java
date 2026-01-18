package com.project.payflow.controller;

import com.project.payflow.dto.NotificationDto;
import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.Notification;
import com.project.payflow.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/me/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    private Merchant getCurrentMerchant(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Merchant merchant)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return merchant;
    }

    @GetMapping
    public List<NotificationDto> list(Authentication auth) {
        Merchant merchant = getCurrentMerchant(auth);
        List<NotificationDto> notifications = notificationRepository
                .findByMerchantIdOrderByCreatedAtDesc(merchant.getId())
                .stream()
                .map(NotificationDto::fromEntity)
                .toList();
    return notifications;
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication auth) {
        Merchant merchant = getCurrentMerchant(auth);
        long count = notificationRepository
                .findByMerchantIdAndReadFalseOrderByCreatedAtDesc(merchant.getId())
                .size();
        return Map.of("unreadCount", count);
    }

    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id, Authentication auth) {
        Merchant merchant = getCurrentMerchant(auth);

        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!n.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        n.setRead(true);
        notificationRepository.save(n);
    }
}