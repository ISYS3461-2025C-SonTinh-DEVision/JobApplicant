package com.DEVision.JobApplicant.subscription.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import com.DEVision.JobApplicant.notification.entity.Notification;
import com.DEVision.JobApplicant.notification.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.DEVision.JobApplicant.subscription.client.JobManagerClient;
import com.DEVision.JobApplicant.subscription.dto.PaymentResponse;
import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionRequest;
import com.DEVision.JobApplicant.subscription.dto.SubscriptionResponse;
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
    private final NotificationService notificationService;

    @Transactional
    public SubscriptionResponse subscribe(String userId, String email, PlanType planType) {
//      Get price based on plan type
        BigDecimal amount = resolvePrice(planType);

//      Resolve subscription type for Job Manager API
        String subscriptionType = resolveSubscriptionType(planType);

//      Process payment via Job Manager
        PaymentResponse paymentResponse = jobManagerClient.processPayment(email, amount, subscriptionType);
        if (paymentResponse == null || !paymentResponse.isSuccessful()) {
            throw new IllegalStateException("Payment processing failed for user: " + userId);
        }

//      Record the payment transaction
        PaymentTransactionRequest transactionRequest = new PaymentTransactionRequest(
                userId,
                amount,
                paymentResponse.currency(),
                TransactionStatus.PENDING,
                paymentResponse.transactionId()
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
        subscription.setStatus(SubscriptionStatus.PENDING);
        subscription.setStartDate(startDate);
        subscription.setExpiresAt(newExpiry);
        subscription.setUpdatedAt(now);

        Subscription savedSubscription = subscriptionRepository.save(subscription);
        return new SubscriptionResponse(savedSubscription, paymentResponse.paymentUrl());
    }

    public Subscription getSubscriptionByUserId(String userId) {
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found for user: " + userId));
        
        return checkAndDowngradeIfExpired(subscription);
    }

    private Subscription checkAndDowngradeIfExpired(Subscription subscription) {
        if (subscription.getPlanType() != PlanType.PREMIUM 
                || subscription.getStatus() != SubscriptionStatus.ACTIVE
                || subscription.getExpiresAt() == null) {
            return subscription;
        }
        
        Instant now = Instant.now();
        if (subscription.getExpiresAt().isBefore(now)) {
            subscription.setPlanType(PlanType.FREEMIUM);
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setExpiresAt(null);
            subscription.setUpdatedAt(now);
            
            Subscription saved = subscriptionRepository.save(subscription);
            sendExpirationNotification(subscription.getUserId());
            return saved;
        }
        
        return subscription;
    }

    public Subscription createFreemiumSubscription(String userId) {
        return createSubscription(userId, PlanType.FREEMIUM);
    }

    public Subscription createSubscription(String userId, PlanType planType) {
        if (subscriptionRepository.findByUserId(userId).isPresent()) {
            return subscriptionRepository.findByUserId(userId).get();
        }

        Instant now = Instant.now();
        Instant expiresAt = (planType == PlanType.PREMIUM) 
                ? now.plus(PLAN_DURATION_DAYS, ChronoUnit.DAYS) 
                : null;

        Subscription subscription = Subscription.builder()
                .userId(userId)
                .planType(planType)
                .status(SubscriptionStatus.ACTIVE)
                .startDate(now)
                .expiresAt(expiresAt)
                .updatedAt(now)
                .createdAt(now)
                .build();

        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public void activateSubscription(String userId) {
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found for user: " + userId));

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setUpdatedAt(Instant.now());
        subscriptionRepository.save(subscription);
    }

    @Transactional
    public void cancelSubscription(String userId) {
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found for user: " + userId));

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setUpdatedAt(Instant.now());
        subscriptionRepository.save(subscription);
    }

    private BigDecimal resolvePrice(PlanType planType) {
        return switch (planType) {
            case PREMIUM -> PREMIUM_PRICE;
            case FREEMIUM -> FREEMIUM_PRICE;
        };
    }

    private String resolveSubscriptionType(PlanType planType) {
        return switch (planType) {
            case PREMIUM -> "applicant_premium";
            case FREEMIUM -> "applicant_freemium";
        };
    }

    // Runs daily at midnight - catches expired subscriptions not accessed by users
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expireSubscriptions() {
        Instant now = Instant.now();
        subscriptionRepository.findAll().stream()
                .filter(s -> s.getPlanType() == PlanType.PREMIUM)
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .filter(s -> s.getExpiresAt() != null)
                .filter(s -> s.getExpiresAt().isBefore(now))
                .forEach(s -> {
                    s.setPlanType(PlanType.FREEMIUM);
                    s.setStatus(SubscriptionStatus.ACTIVE);
                    s.setExpiresAt(null);
                    s.setUpdatedAt(now);
                    subscriptionRepository.save(s);
                    sendExpirationNotification(s.getUserId());
                });
    }

    @Transactional
    public Subscription downgradeToFreemium(String userId) {
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found for user: " + userId));

        if (subscription.getPlanType() != PlanType.PREMIUM) {
            throw new IllegalStateException("User is not on PREMIUM plan");
        }

        Instant now = Instant.now();
        subscription.setPlanType(PlanType.FREEMIUM);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setExpiresAt(null);
        subscription.setUpdatedAt(now);

        return subscriptionRepository.save(subscription);
    }

    private void sendExpirationNotification(String userId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle("Premium Subscription Expired");
        notification.setContent("Your premium subscription has expired. Upgrade anytime to regain premium features.");
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notificationService.createNotification(notification);
    }
}
