// src/main/java/com/project/payflow/controller/AccountController.java
package com.project.payflow.controller;

import com.project.payflow.dto.ChangePasswordRequest;
import com.project.payflow.entities.Merchant;
import com.project.payflow.repository.MerchantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/me")
public class AccountController {

    private final MerchantRepository merchantRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountController(MerchantRepository merchantRepository,
                             PasswordEncoder passwordEncoder) {
        this.merchantRepository = merchantRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private Merchant getCurrentMerchant() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Merchant)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return (Merchant) auth.getPrincipal();
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@RequestBody ChangePasswordRequest req) {
        if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()
                || req.getNewPassword() == null || req.getNewPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both passwords are required");
        }

        Merchant current = getCurrentMerchant();

        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(req.getCurrentPassword(), current.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        // Mettre à jour le mot de passe
        current.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        merchantRepository.save(current);
    }
}