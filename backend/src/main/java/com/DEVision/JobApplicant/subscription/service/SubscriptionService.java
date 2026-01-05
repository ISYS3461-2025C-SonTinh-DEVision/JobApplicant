package com.DEVision.JobApplicant.subscription.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.DEVision.JobApplicant.subscription.client.JobManagerClient;
import com.DEVision.JobApplicant.subscription.dto.PaymentResponse;
import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionRequest;
import com.DEVision.JobApplicant.subscription.entity.Subscription;
import com.DEVision.JobApplicant.subscription.enums.PlanType;
import com.DEVision.JobApplicant.subscription.enums.SubscriptionStatus;
import com.DEVision.JobApplicant.subscription.enums.TransactionStatus;
import com.DEVision.JobApplicant.subscription.repository.SubscriptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final BigDecimal PREMIUM_PRICE = new BigDecimal("10.00");
    private static final BigDecimal FREEMIUM_PRICE = BigDecimal.ZERO;
    private static final long PLAN_DURATION_DAYS = 30L;

    private final PaymentTransactionService paymentTransactionService;
    private final SubscriptionRepository subscriptionRepository;
    private final JobManagerClient jobManagerClient;

    @Transactional
    public Subscription subscribe(String userId, PlanType planType) {
//      Get price based on plan type
        BigDecimal amount = resolvePrice(planType);

//      Process payment via Job Manager
        PaymentResponse paymentResponse = jobManagerClient.processPayment(userId, amount);
        if (paymentResponse == null || !paymentResponse.success()) {
            throw new IllegalStateException("Payment processing failed for user: " + userId);
        }

//      Record the payment transaction
        PaymentTransactionRequest transactionRequest = new PaymentTransactionRequest(
                userId,
                amount,
                paymentResponse.currency(),
                TransactionStatus.COMPLETED,
                paymentResponse.externalTransactionId()
        );
        paymentTransactionService.createTransaction(transactionRequest);

//      Update or create subscription
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> Subscription.builder().userId(userId).build());

        Instant now = Instant.now();
        Instant existingExpiry = subscription.getExpiresAt();
        boolean currentlyActive = subscription.getStatus() == SubscriptionStatus.ACTIVE
                && existingExpiry != null
                && existingExpiry.isAfter(now);

        Instant baseTime = currentlyActive ? existingExpiry : now;
        Instant newExpiry = baseTime.plus(PLAN_DURATION_DAYS, ChronoUnit.DAYS);
        Instant startDate = currentlyActive && subscription.getStartDate() != null ? subscription.getStartDate() : now;

        subscription.setPlanType(planType);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(startDate);
        subscription.setExpiresAt(newExpiry);
        subscription.setUpdatedAt(now);

        return subscriptionRepository.save(subscription);
    }

    private BigDecimal resolvePrice(PlanType planType) {
        return switch (planType) {
            case PREMIUM -> PREMIUM_PRICE;
            case FREEMIUM -> FREEMIUM_PRICE;
        };
    }
}
