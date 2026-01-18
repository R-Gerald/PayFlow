// src/main/java/com/project/payflow/repository/TransactionRepository.java
package com.project.payflow.repository;

import com.project.payflow.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;

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

List<Transaction> findByMerchantIdAndTransactionDateGreaterThanEqual(Long merchantId, LocalDate from);

// Période de fin seulement
List<Transaction> findByMerchantIdAndTransactionDateLessThanEqual(Long merchantId, LocalDate to);

// Période complète
List<Transaction> findByMerchantIdAndTransactionDateBetween(Long merchantId, LocalDate from, LocalDate to);
@Query("""
select distinct c.id
from Customer c
join Transaction t on t.customer = c
where c.merchant.id = :merchantId
  and t.type = com.project.payflow.entities.TransactionType.CREDIT
  and t.dueDate is not null
  and t.dueDate < CURRENT_DATE
  and (
    select coalesce(sum(tc.amount), 0)
    from Transaction tc
    where tc.customer = c
      and tc.merchant.id = :merchantId
      and tc.type = com.project.payflow.entities.TransactionType.CREDIT
  )
  -
  (
    select coalesce(sum(tp.amount), 0)
    from Transaction tp
    where tp.customer = c
      and tp.merchant.id = :merchantId
      and tp.type = com.project.payflow.entities.TransactionType.PAYMENT
  ) > 0
""")
List<Long> findOverdueCustomerIds(Long merchantId);

@Query("""
    select t
    from Transaction t
    where t.merchant.id = :merchantId
      and t.type = com.project.payflow.entities.TransactionType.CREDIT
      and t.dueDate = :dueDate
""")
java.util.List<Transaction> findCreditsByMerchantAndDueDate(Long merchantId, java.time.LocalDate dueDate);

@Query("""
    select t
    from Transaction t
    where t.merchant.id = :merchantId
      and t.customer.id = :customerId
      and t.type = com.project.payflow.entities.TransactionType.CREDIT
      and t.amount > 0
    order by t.dueDate nulls last, t.transactionDate, t.id
""")
List<Transaction> findCreditsByMerchantAndCustomer(Long merchantId, Long customerId);


}