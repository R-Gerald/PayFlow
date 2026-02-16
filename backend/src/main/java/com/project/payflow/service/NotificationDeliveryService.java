// src/main/java/com/project/payflow/service/NotificationDeliveryService.java
package com.project.payflow.service;

import com.project.payflow.entities.OutboundNotification;
import com.project.payflow.repository.OutboundNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class NotificationDeliveryService {

    private final OutboundNotificationRepository outboundNotificationRepository;

    public NotificationDeliveryService(OutboundNotificationRepository outboundNotificationRepository) {
        this.outboundNotificationRepository = outboundNotificationRepository;
    }

    @Transactional
    public void processPendingBatch() {
        // On limite à 100 pour ne pas tout avaler d'un coup
        List<OutboundNotification> pendings =
                outboundNotificationRepository.findTop100ByStatusOrderByCreatedAtAsc("PENDING");

        if (pendings.isEmpty()) {
            return;
        }

        for (OutboundNotification n : pendings) {
            try {
                switch (n.getChannel()) {
                    case "IN_APP" -> handleInApp(n);
                    case "SMS" -> handleSms(n);
                    case "EMAIL" -> handleEmail(n);
                    case "WHATSAPP" -> handleWhatsApp(n);
                    default -> handleUnknownChannel(n);
                }

                // Si tout s'est bien passé
                n.setStatus("SENT");
                n.setSentAt(OffsetDateTime.now());
                n.setErrorMessage(null);

            } catch (Exception e) {
                // En cas d'erreur d'envoi
                n.setStatus("FAILED");
                n.setErrorMessage(e.getMessage());
            }

            outboundNotificationRepository.save(n);
        }
    }

    private void handleInApp(OutboundNotification n) {
        // Pour l'instant, les notifications IN_APP sont déjà visibles via la table notifications,
        // donc ici on se contente de marquer l'outbound comme "traitée".
        System.out.println("[NOTIF] IN_APP for customer "
                + (n.getCustomer() != null ? n.getCustomer().getId() : "null")
                + " : " + n.getTitle() + " -> " + n.getMessage());
    }

    private void handleSms(OutboundNotification n) {
        // Ici on branchera Twilio ou un SMS local.
        // Pour l'instant : simple log (et marquage SENT si pas d'exception).
        String phone = n.getCustomer() != null ? n.getCustomer().getPhone() : null;
        if (phone == null || phone.isBlank()) {
            throw new IllegalStateException("Pas de numéro de téléphone pour ce client");
        }

        System.out.println("[NOTIF] SMS to " + phone + " : " + n.getMessage());
        // TODO plus tard: intégration Twilio / SMS local
    }

    private void handleEmail(OutboundNotification n) {
        // TODO: intégrer un fournisseur email (SendGrid, Postmark, etc.)
        System.out.println("[NOTIF] EMAIL for customer "
                + (n.getCustomer() != null ? n.getCustomer().getId() : "null")
                + " : " + n.getTitle() + " -> " + n.getMessage());
    }

    private void handleWhatsApp(OutboundNotification n) {
        // TODO: intégrer API WhatsApp
        System.out.println("[NOTIF] WHATSAPP for customer "
                + (n.getCustomer() != null ? n.getCustomer().getId() : "null")
                + " : " + n.getMessage());
    }

    private void handleUnknownChannel(OutboundNotification n) {
        throw new IllegalArgumentException("Canal inconnu : " + n.getChannel());
    }
}