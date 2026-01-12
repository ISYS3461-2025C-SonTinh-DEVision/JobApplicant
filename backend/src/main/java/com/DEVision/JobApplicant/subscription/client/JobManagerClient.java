package com.DEVision.JobApplicant.subscription.client;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
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
        // Build URLs for Stripe redirect (frontend)
        // Note: JM handles payment callbacks internally via Stripe webhooks
        // JA receives callback from JM at /api/subscription/payment/callback
        String successUrl = frontendBaseUrl + "/dashboard/subscription?payment=success";
        String cancelUrl = frontendBaseUrl + "/dashboard/subscription?payment=cancelled";

        PaymentRequest request = new PaymentRequest(
                email,
                amount,
                DEFAULT_CURRENCY,
                DEFAULT_PAYMENT_METHOD,
                subscriptionType,
                successUrl,
                cancelUrl
        );

        return restClient.post()
                .uri("/api/payments/process")
                .header("Authorization", cognitoTokenService.getAuthorizationHeader())
                .body(request)
                .retrieve()
                .body(PaymentResponse.class);
    }
}

