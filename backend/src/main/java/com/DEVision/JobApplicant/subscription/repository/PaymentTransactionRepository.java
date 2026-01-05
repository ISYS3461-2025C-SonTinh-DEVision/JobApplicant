package com.DEVision.JobApplicant.subscription.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.subscription.entity.PaymentTransaction;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {

    boolean existsByExternalTransactionId(String externalTransactionId);

    Optional<PaymentTransaction> findByExternalTransactionId(String externalTransactionId);

    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(String userId);
}
