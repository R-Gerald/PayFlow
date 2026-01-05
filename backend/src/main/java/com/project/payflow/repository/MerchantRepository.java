package com.project.payflow.repository;
import com.project.payflow.entities.*;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MerchantRepository extends JpaRepository<Merchant,Long> {
    
     Optional<Merchant> findByPhone(String phone);
}
