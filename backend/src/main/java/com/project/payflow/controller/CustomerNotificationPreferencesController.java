// src/main/java/com/project/payflow/controller/CustomerNotificationPreferencesController.java
package com.project.payflow.controller;

import com.project.payflow.dto.NotificationPreferencesDto;
import com.project.payflow.entities.Customer;
import com.project.payflow.entities.Merchant;
import com.project.payflow.entities.NotificationPreferences;
import com.project.payflow.repository.CustomerRepository;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.service.NotificationPreferencesService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/me/customers/{customerId}/notification-preferences")
public class CustomerNotificationPreferencesController {

    private final CustomerRepository customerRepository;
    private final MerchantRepository merchantRepository;
    private final NotificationPreferencesService preferencesService;

    public CustomerNotificationPreferencesController(CustomerRepository customerRepository,
                                                     MerchantRepository merchantRepository,
                                                     NotificationPreferencesService preferencesService) {
        this.customerRepository = customerRepository;
        this.merchantRepository = merchantRepository;
        this.preferencesService = preferencesService;
    }

    private Merchant getCurrentMerchant() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Merchant m)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return merchantRepository.findById(m.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found"));
    }

    private Customer getCustomerOrThrow(Long customerId, Merchant merchant) {
        Customer c = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (!c.getMerchant().getId().equals(merchant.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return c;
    }

    @GetMapping
    public NotificationPreferencesDto getPreferences(@PathVariable Long customerId) {
        Merchant merchant = getCurrentMerchant();
        Customer customer = getCustomerOrThrow(customerId, merchant);

        NotificationPreferences np = preferencesService.getOrCreateDefault(merchant, customer);
        return NotificationPreferencesDto.fromEntity(np);
    }

    @PutMapping
    public NotificationPreferencesDto updatePreferences(@PathVariable Long customerId,
                                                        @RequestBody NotificationPreferencesDto dto) {
        Merchant merchant = getCurrentMerchant();
        Customer customer = getCustomerOrThrow(customerId, merchant);

        NotificationPreferences np = preferencesService.getOrCreateDefault(merchant, customer);

        // Mise à jour basique avec validation minimale
        if (dto.getPreferredChannel() != null) {
            np.setPreferredChannel(dto.getPreferredChannel().toUpperCase());
        }
        np.setAllowInApp(dto.isAllowInApp());
        np.setAllowSms(dto.isAllowSms());
        np.setAllowWhatsapp(dto.isAllowWhatsapp());
        np.setAllowEmail(dto.isAllowEmail());

        NotificationPreferences saved = preferencesService.save(np);
        return NotificationPreferencesDto.fromEntity(saved);
    }
}