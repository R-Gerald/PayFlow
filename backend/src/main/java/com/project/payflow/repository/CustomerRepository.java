package com.project.payflow.repository;

import com.project.payflow.entities.*;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer,Long> {
    List<Customer> findByMerchantId(Long merchantId);
}
