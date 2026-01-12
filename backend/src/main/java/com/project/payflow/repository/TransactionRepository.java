// src/main/java/com/project/payflow/repository/TransactionRepository.java
package com.project.payflow.repository;

import com.project.payflow.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByMerchantId(Long merchantId);

    List<Transaction> findByCustomerId(Long customerId);

    List<Transaction> findByMerchantIdAndCustomerId(Long merchantId, Long customerId);

    // Somme des montants par client pour un merchant donné (JPQL)
    @Query("""
        select t.customer.id,
               sum(
                 case
                   when t.type = com.project.payflow.entities.TransactionType.CREDIT then t.amount
                   when t.type = com.project.payflow.entities.TransactionType.PAYMENT then -t.amount
                   else 0
                 end
               )
        from Transaction t
        where t.merchant.id = :merchantId
        group by t.customer.id
        """)
    List<Object[]> findClientBalancesByMerchant(Long merchantId);

    // Totaux globaux pour les stats (JPQL)
   // src/main/java/com/project/payflow/repository/TransactionRepository.java

@Query("""
    select
      sum(case when t.type = com.project.payflow.entities.TransactionType.CREDIT then t.amount else 0 end),
      sum(case when t.type = com.project.payflow.entities.TransactionType.PAYMENT then t.amount else 0 end)
    from Transaction t
    where t.merchant.id = :merchantId
    """)
java.util.List<Object[]> findTotalsByMerchant(Long merchantId);
}