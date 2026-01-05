package com.DEVision.JobApplicant.subscription.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

import com.DEVision.JobApplicant.subscription.enums.PaymentProvider;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.DEVision.JobApplicant.subscription.enums.TransactionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payment_transactions")
public class PaymentTransaction {

    @Id
    private String id;

    @Indexed
    private String userId;
    private String userEmail;
    private BigDecimal amount;
    private String currency;
    private TransactionStatus status;
    private PaymentProvider paymentProvider;
    private String externalTransactionId;

    @Field("transaction_time")
    private Instant transactionTime;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;
}

