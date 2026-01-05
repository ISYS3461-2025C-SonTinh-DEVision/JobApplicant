package com.DEVision.JobApplicant.subscription.entity;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.DEVision.JobApplicant.subscription.enums.PlanType;
import com.DEVision.JobApplicant.subscription.enums.SubscriptionStatus;

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
@Document(collection = "subscriptions")
public class Subscription {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private PlanType planType;
    private SubscriptionStatus status;
    private Instant startDate;
    private Instant expiresAt;

    @Field("updated_at")
    private Instant updatedAt;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;
}

