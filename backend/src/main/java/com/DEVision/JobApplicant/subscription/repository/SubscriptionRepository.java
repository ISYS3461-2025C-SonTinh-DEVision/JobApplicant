package com.DEVision.JobApplicant.subscription.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.DEVision.JobApplicant.subscription.entity.Subscription;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {

    Optional<Subscription> findByUserId(String userId);
}

