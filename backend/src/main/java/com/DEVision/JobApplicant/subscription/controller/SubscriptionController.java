package com.DEVision.JobApplicant.subscription.controller;

import java.util.List;

import com.DEVision.JobApplicant.subscription.dto.SubscriptionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionDto;
import com.DEVision.JobApplicant.subscription.dto.SubscriptionRequest;
import com.DEVision.JobApplicant.subscription.entity.Subscription;
import com.DEVision.JobApplicant.subscription.service.PaymentTransactionService;
import com.DEVision.JobApplicant.subscription.service.SubscriptionService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final PaymentTransactionService paymentTransactionService;

    public SubscriptionController(SubscriptionService subscriptionService, PaymentTransactionService paymentTransactionService) {
        this.subscriptionService = subscriptionService;
        this.paymentTransactionService = paymentTransactionService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<SubscriptionResponse> subscribe(
            @RequestParam String userId,
            @Valid @RequestBody SubscriptionRequest request) {
        SubscriptionResponse response = subscriptionService.subscribe(userId, request.email(), request.planType());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<PaymentTransactionDto>> getUserTransactions(@RequestParam String userId) {
        List<PaymentTransactionDto> transactions = paymentTransactionService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping
    public ResponseEntity<Subscription> getSubscriptionByUserId(@RequestParam String userId) {
        Subscription subscription = subscriptionService.getSubscriptionByUserId(userId);
        return ResponseEntity.ok(subscription);
    }
}
