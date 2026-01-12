// src/main/java/com/project/payflow/controller/CustomerController.java
package com.project.payflow.controller;

import com.project.payflow.dto.CreateCustomerRequest;
import com.project.payflow.dto.CustomerDto;
import com.project.payflow.dto.UpdateCustomerRequest;
import com.project.payflow.entities.Customer;
import com.project.payflow.entities.Merchant;
import com.project.payflow.repository.CustomerRepository;
import com.project.payflow.repository.MerchantRepository;
import com.project.payflow.repository.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/me/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final MerchantRepository merchantRepository;
    private final TransactionRepository transactionRepository;

    public CustomerController(CustomerRepository customerRepository,
                              MerchantRepository merchantRepository,
                              TransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.merchantRepository = merchantRepository;
        this.transactionRepository = transactionRepository;
    }
    private Long getCurrentMerchantId()
    {
        Authentication auth=SecurityContextHolder.getContext().getAuthentication();
        if(auth == null || !(auth.getPrincipal() instanceof Merchant))
        {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"not authenticated");
        }
        Merchant m=(Merchant)auth.getPrincipal();
        return m.getId();
    }

    @GetMapping
    public List<CustomerDto> list() {
           Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    System.out.println("[CUSTOMERS] Auth = " + auth);

    if (auth == null || !(auth.getPrincipal() instanceof Merchant)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authenticated");
    }

    Merchant authMerchant = (Merchant) auth.getPrincipal();
    Long merchantId = authMerchant.getId();
        // 1) charger tous les clients du merchant
        List<Customer> customers = customerRepository.findByMerchantId(merchantId);

        // 2) récupérer les soldes par client à partir des transactions
        Map<Long, BigDecimal> balances = new HashMap<>();
        for (Object[] row : transactionRepository.findClientBalancesByMerchant(merchantId)) {
            Long customerId = (Long) row[0];
            BigDecimal balance = (BigDecimal) row[1];
            balances.put(customerId, balance);
        }

        // 3) construire les DTO avec totalDue
        return customers.stream()
                .map(c -> CustomerDto.fromEntity(c, balances.get(c.getId())))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerDto create(@RequestBody CreateCustomerRequest request) {
          Merchant authMerchant = (Merchant) SecurityContextHolder.getContext()
            .getAuthentication()
            .getPrincipal();
        Long merchantId = authMerchant.getId();

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

        // à la création, totalDue = 0
        return CustomerDto.fromEntity(saved, BigDecimal.ZERO);
    }
    // PUT /api/me/customers/{customerId}
    @PutMapping("/{customerId}")
    public CustomerDto update(@PathVariable Long customerId,
                              @RequestBody UpdateCustomerRequest req) {
        Long merchantId = getCurrentMerchantId();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        // Vérifier que ce client appartient bien au merchant connecté
        if (!customer.getMerchant().getId().equals(merchantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (req.getName() != null && !req.getName().isBlank()) {
            customer.setName(req.getName());
        }
        customer.setPhone(req.getPhone());
        customer.setNotes(req.getNotes());

        Customer saved = customerRepository.save(customer);

        // recalculer son totalDue (facultatif, tu peux réutiliser la logique existante)
        BigDecimal totalDue = BigDecimal.ZERO;
        for (Object[] row : transactionRepository.findClientBalancesByMerchant(merchantId)) {
            Long cId = (Long) row[0];
            if (cId.equals(saved.getId())) {
                totalDue = (BigDecimal) row[1];
                break;
            }
        }

        return CustomerDto.fromEntity(saved, totalDue);
    }
    // DELETE /api/me/customers/{customerId}
    @DeleteMapping("/{customerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long customerId) {
        Long merchantId = getCurrentMerchantId();

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (!customer.getMerchant().getId().equals(merchantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        // Grâce au ON DELETE CASCADE sur transactions.customer_id et .merchant_id
        // les transactions liées seront supprimées automatiquement.
        customerRepository.delete(customer);
    }
}