package com.DEVision.JobApplicant.subscription.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.subscription.dto.PaymentCallbackRequest;
import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionDto;
import com.DEVision.JobApplicant.subscription.dto.SubscriptionRequest;
import com.DEVision.JobApplicant.subscription.dto.SubscriptionResponse;
import com.DEVision.JobApplicant.subscription.entity.PaymentTransaction;
import com.DEVision.JobApplicant.subscription.entity.Subscription;
import com.DEVision.JobApplicant.subscription.enums.TransactionStatus;
import com.DEVision.JobApplicant.subscription.service.PaymentTransactionService;
import com.DEVision.JobApplicant.subscription.service.SubscriptionService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PaymentTransactionService paymentTransactionService;
    private final AuthRepository authRepository;

    public SubscriptionController(
            SubscriptionService subscriptionService,
            PaymentTransactionService paymentTransactionService,
            AuthRepository authRepository) {
        this.subscriptionService = subscriptionService;
        this.paymentTransactionService = paymentTransactionService;
        this.authRepository = authRepository;
    }

    /**
     * Helper method to get user ID from authenticated user
     */
    private String getUserIdFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            return null;
        }
        User user = authRepository.findByEmail(userDetails.getUsername());
        return user != null ? user.getId() : null;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(
            @Valid @RequestBody SubscriptionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String userId = getUserIdFromUserDetails(userDetails);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        SubscriptionResponse response = subscriptionService.subscribe(userId, request.email(), request.planType());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getUserTransactions(@AuthenticationPrincipal UserDetails userDetails) {

        String userId = getUserIdFromUserDetails(userDetails);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        List<PaymentTransactionDto> transactions = paymentTransactionService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<?> getSubscriptionByUserId(@AuthenticationPrincipal UserDetails userDetails) {

        String userId = getUserIdFromUserDetails(userDetails);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        Subscription subscription = subscriptionService.getSubscriptionByUserId(userId);
        return ResponseEntity.ok(subscription);
    }

    @PostMapping("/payment/callback")
    public ResponseEntity<Void> handlePaymentCallback(@Valid @RequestBody PaymentCallbackRequest request) {
        // Update transaction status
        PaymentTransaction transaction = paymentTransactionService.handlePaymentCallback(request);

        // Update subscription status based on payment result
        if (transaction.getStatus() == TransactionStatus.COMPLETED) {
            subscriptionService.activateSubscription(transaction.getUserId());
        } else if (transaction.getStatus() == TransactionStatus.FAILED) {
            subscriptionService.cancelSubscription(transaction.getUserId());
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(@AuthenticationPrincipal UserDetails userDetails) {

        String userId = getUserIdFromUserDetails(userDetails);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        subscriptionService.cancelSubscription(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Downgrade from PREMIUM to FREEMIUM.
     * User voluntarily cancels their premium subscription and reverts to free plan.
     */
    @PostMapping("/downgrade")
    public ResponseEntity<?> downgradeToFreemium(@AuthenticationPrincipal UserDetails userDetails) {

        String userId = getUserIdFromUserDetails(userDetails);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        try {
            Subscription subscription = subscriptionService.downgradeToFreemium(userId);
            return ResponseEntity.ok(subscription);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getSubscriptionStatus(@AuthenticationPrincipal UserDetails userDetails) {

        String userId = getUserIdFromUserDetails(userDetails);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not authenticated");
        }

        Subscription subscription = subscriptionService.getSubscriptionByUserId(userId);
        String status = subscription.getStatus().name();
        return ResponseEntity.ok(status);
    }
}
