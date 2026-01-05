package com.DEVision.JobApplicant.subscription.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.DEVision.JobApplicant.subscription.dto.PaymentCallbackRequest;
import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionDto;
import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionRequest;
import com.DEVision.JobApplicant.subscription.entity.PaymentTransaction;
import com.DEVision.JobApplicant.subscription.enums.TransactionStatus;
import com.DEVision.JobApplicant.subscription.repository.PaymentTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentTransactionService {

    private final PaymentTransactionRepository paymentTransactionRepository;

    public void createTransaction(PaymentTransactionRequest request) {
//      External transaction ID must be unique (this should be based on transaction ID from JM)
        if (paymentTransactionRepository.existsByExternalTransactionId(request.externalTransactionId())) {
            throw new IllegalArgumentException("Transaction already exists for external id: " + request.externalTransactionId());
        }

        PaymentTransaction transaction = PaymentTransaction.builder()
                .userId(request.userId())
                .amount(request.amount())
                .currency(request.currency())
                .status(request.status())
                .externalTransactionId(request.externalTransactionId())
                .build();

        paymentTransactionRepository.save(transaction);
    }

    @Transactional
    public PaymentTransaction handlePaymentCallback(PaymentCallbackRequest request) {
        PaymentTransaction transaction = paymentTransactionRepository
                .findByExternalTransactionId(request.transactionId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Transaction not found for external id: " + request.transactionId()));

        TransactionStatus newStatus = mapCallbackStatus(request.status());
        transaction.setStatus(newStatus);
        transaction.setTransactionTime(request.occurredAt());

        return paymentTransactionRepository.save(transaction);
    }

//  This is only needed if JM system uses different status values than our TransactionStatus enum
    private TransactionStatus mapCallbackStatus(String status) {
        return switch (status.toUpperCase()) {
            case "SUCCESS", "COMPLETED" -> TransactionStatus.COMPLETED;
            case "FAILED", "CANCELLED" -> TransactionStatus.FAILED;
            default -> TransactionStatus.PENDING;
        };
    }

    public List<PaymentTransactionDto> getUserTransactions(String userId) {
        return paymentTransactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private PaymentTransactionDto toDto(PaymentTransaction transaction) {
        return new PaymentTransactionDto(
                transaction.getId(),
                transaction.getUserId(),
                transaction.getUserEmail(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getStatus(),
                transaction.getPaymentProvider(),
                transaction.getExternalTransactionId(),
                transaction.getTransactionTime(),
                transaction.getCreatedAt()
        );
    }
}

