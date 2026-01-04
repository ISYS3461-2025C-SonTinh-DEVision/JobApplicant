package com.DEVision.JobApplicant.subscription.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.subscription.entity.PaymentTransaction;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {

    boolean existsByExternalTransactionId(String externalTransactionId);

    List<PaymentTransaction> findByUserIdOrderByCreatedAtDesc(String userId);
}
