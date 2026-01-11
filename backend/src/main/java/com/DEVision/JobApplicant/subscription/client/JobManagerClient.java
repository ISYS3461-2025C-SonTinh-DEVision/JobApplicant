package com.DEVision.JobApplicant.subscription.client;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.DEVision.JobApplicant.auth.service.CognitoTokenService;
import com.DEVision.JobApplicant.subscription.dto.PaymentRequest;
import com.DEVision.JobApplicant.subscription.dto.PaymentResponse;

/**
 * Client for communicating with Job Manager system.
 * Uses Cognito OAuth2 tokens for system-to-system authentication.
 */
@Component
public class JobManagerClient {

    private static final String DEFAULT_CURRENCY = "USD";
    private static final String DEFAULT_PAYMENT_METHOD = "stripe";
    private static final String SUCCESS_URL = "https://ja.devision.sbs/dashboard";
    private static final String CANCEL_URL = "https://ja.devision.sbs/dashboard";

    private final RestClient restClient;
    
    @Autowired
    private CognitoTokenService cognitoTokenService;

    public JobManagerClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public PaymentResponse processPayment(String email, BigDecimal amount, String subscriptionType) {
        PaymentRequest request = new PaymentRequest(
                email,
                amount,
                DEFAULT_CURRENCY,
                DEFAULT_PAYMENT_METHOD,
                subscriptionType,
                SUCCESS_URL,
                CANCEL_URL
        );

        return restClient.post()
                .uri("/api/payments/process")
                .header("Authorization", cognitoTokenService.getAuthorizationHeader())
                .body(request)
                .retrieve()
                .body(PaymentResponse.class);
    }
}

