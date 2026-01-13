package com.DEVision.JobApplicant.subscription.client;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.DEVision.JobApplicant.auth.service.CognitoTokenService;
import com.DEVision.JobApplicant.subscription.dto.PaymentRequest;
import com.DEVision.JobApplicant.subscription.dto.PaymentResponse;

import lombok.extern.slf4j.Slf4j;

/**
 * Client for communicating with Job Manager system.
 * Uses Cognito OAuth2 tokens for system-to-system authentication.
 */
@Slf4j
@Component
public class JobManagerClient {

    private static final String DEFAULT_CURRENCY = "USD";
    private static final String DEFAULT_PAYMENT_METHOD = "stripe";

    private final RestClient restClient;
    
    @Autowired
    private CognitoTokenService cognitoTokenService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String backendBaseUrl;

    public JobManagerClient(@Qualifier("jobManagerRestClient") RestClient restClient) {
        this.restClient = restClient;
    }


    public PaymentResponse processPayment(String email, BigDecimal amount, String subscriptionType) {
        return processPayment(email, amount, subscriptionType, null, null);
    }

    public PaymentResponse processPayment(String email, BigDecimal amount, String subscriptionType, 
                                          String externalSubscriptionId, String applicantId) {
        // Build URLs for Stripe redirect (frontend)
        String successUrl = frontendBaseUrl + "/dashboard/subscription?payment=success";
        String cancelUrl = frontendBaseUrl + "/dashboard/subscription?payment=cancelled";
        
        // Build callback URL for JM to notify JA when payment completes
        String callbackUrl = backendBaseUrl + "/api/subscription/payment/callback";

        PaymentRequest request = new PaymentRequest(
                email,
                amount,
                DEFAULT_CURRENCY,
                DEFAULT_PAYMENT_METHOD,
                subscriptionType,
                successUrl,
                cancelUrl,
                callbackUrl,
                externalSubscriptionId,
                applicantId
        );

        log.info("Calling JM Payment API: /api/payments/process");
        log.info("  Email: {}, Amount: {}, SubscriptionType: {}", email, amount, subscriptionType);
        log.info("  CallbackUrl: {}", callbackUrl);

        try {
            PaymentResponse response = restClient.post()
                    .uri("/api/payments/process")
                    .header("Authorization", cognitoTokenService.getAuthorizationHeader())
                    .body(request)
                    .retrieve()
                    .body(PaymentResponse.class);
            
            log.info("JM Payment Response: transactionId={}, status={}", 
                    response != null ? response.transactionId() : "null",
                    response != null ? response.status() : "null");
            
            return response;
        } catch (RestClientException e) {
            log.error("Failed to call JM Payment API: {}", e.getMessage());
            throw new RuntimeException("Payment service unavailable: " + e.getMessage(), e);
        }
    }
}


