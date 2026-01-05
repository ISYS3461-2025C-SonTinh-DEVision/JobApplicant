package com.DEVision.JobApplicant.subscription.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionDto;
import com.DEVision.JobApplicant.subscription.dto.PaymentTransactionRequest;
import com.DEVision.JobApplicant.subscription.entity.PaymentTransaction;
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
                .build();

        paymentTransactionRepository.save(transaction);
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

