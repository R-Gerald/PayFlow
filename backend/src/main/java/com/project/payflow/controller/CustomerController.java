package com.project.payflow.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.project.payflow.repository.*;
import com.project.payflow.dto.*;
import com.project.payflow.entities.*;

@RestController
@RequestMapping("/api/merchants/{merchantId}/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final MerchantRepository merchantRepository;

    public CustomerController(CustomerRepository customerRepository,
                              MerchantRepository merchantRepository) {
        this.customerRepository = customerRepository;
        this.merchantRepository = merchantRepository;
    }

    //List les clients d'un merchant
    @GetMapping
    public List<CustomerDto> list(@PathVariable Long merchantId) {
        return customerRepository.findByMerchantId(merchantId)
                .stream()
                .map(CustomerDto::fromEntity)
                .toList();
    }

    //Créer un client pour un merchant
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerDto create(@PathVariable Long merchantId,
                              @RequestBody CreateCustomerRequest request) {

        Merchant merchant = merchantRepository.findById(merchantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found"));

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        Customer customer = new Customer()
                .setMerchant(merchant)
                .setName(request.getName())
                .setPhone(request.getPhone())
                .setNotes(request.getNotes());

        Customer saved = customerRepository.save(customer);

        return CustomerDto.fromEntity(saved);
    }
}