package com.project.payflow.controller;

import com.project.payflow.entities.*;
import com.project.payflow.repository.*;
import com.project.payflow.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

@RestController
@RequestMapping("/api/merchants")
public class MerchantController {

    private final MerchantRepository merchantRepository;

    public MerchantController(MerchantRepository merchantRepository) {
        this.merchantRepository = merchantRepository;
    }

    // Lister tous les merchants (pratique pour tester)
    @GetMapping
    public List<MerchantDto> list() {
        return merchantRepository.findAll()
                .stream()
                .map(MerchantDto::fromEntity)
                .toList();
    }

    // Créer un merchant
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MerchantDto create(@RequestBody CreateMerchantRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        // Pour le moment, hash simple du mot de passe (SHA-256) juste pour tester.
        String passwordHash = hashPassword(request.getPassword());

        Merchant m = new Merchant()
                .setName(request.getName())
                .setPhone(request.getPhone())
                .setEmail(request.getEmail())
                .setPasswordHash(passwordHash);

        Merchant saved = merchantRepository.save(m);

        return MerchantDto.fromEntity(saved);
    }

    private String hashPassword(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashed) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}