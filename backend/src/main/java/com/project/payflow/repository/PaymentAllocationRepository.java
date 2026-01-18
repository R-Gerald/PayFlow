package com.project.payflow.repository;

import com.project.payflow.entities.PaymentAllocation;
import com.project.payflow.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentAllocationRepository extends JpaRepository<PaymentAllocation, Long> {

    List<PaymentAllocation> findByCredit(Transaction credit);

    List<PaymentAllocation> findByPayment(Transaction payment);

    List<PaymentAllocation> findByCustomerIdAndMerchantId(Long customerId, Long merchantId);
}