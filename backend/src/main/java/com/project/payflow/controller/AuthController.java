// src/main/java/com/project/payflow/controller/AuthController.java
package com.project.payflow.controller;

import com.project.payflow.dto.AuthLoginRequest;
import com.project.payflow.dto.AuthRegisterRequest;
import com.project.payflow.dto.AuthResponse;
import com.project.payflow.entities.Merchant;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final MerchantRepository merchantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(MerchantRepository merchantRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.merchantRepository = merchantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody AuthRegisterRequest req) {
        if (req.getPhone() == null || req.getPhone().isBlank() ||
            req.getPassword() == null || req.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone and password are required");
        }

        if (merchantRepository.findByPhone(req.getPhone()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already used");
        }

        Merchant m = new Merchant()
                .setName(req.getName())
                .setPhone(req.getPhone())
                .setEmail(req.getEmail())
                .setPasswordHash(passwordEncoder.encode(req.getPassword()));

        Merchant saved = merchantRepository.save(m);
        String token = jwtService.generateToken(saved.getId(), saved.getPhone());

        return new AuthResponse(saved.getId(), saved.getName(), saved.getPhone(), token);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthLoginRequest req) {
        Merchant m = merchantRepository.findByPhone(req.getPhone())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), m.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generateToken(m.getId(), m.getPhone());
        return new AuthResponse(m.getId(), m.getName(), m.getPhone(), token);
    }
}