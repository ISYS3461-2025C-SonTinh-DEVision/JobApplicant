package com.DEVision.JobApplicant.subscription.client;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.DEVision.JobApplicant.subscription.dto.JMLoginRequest;
import com.DEVision.JobApplicant.subscription.dto.JMLoginResponse;
import com.DEVision.JobApplicant.subscription.dto.PaymentRequest;
import com.DEVision.JobApplicant.subscription.dto.PaymentResponse;

@Component
public class JobManagerClient {

    private static final String DEFAULT_CURRENCY = "USD";
    private static final String DEFAULT_PAYMENT_METHOD = "stripe";

    private final RestClient restClient;

    @Value("${jm.service.email}")
    private String serviceEmail;

    @Value("${jm.service.password}")
    private String servicePassword;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String backendBaseUrl;

    public JobManagerClient(RestClient restClient) {
        this.restClient = restClient;
    }


    public PaymentResponse processPayment(String email, BigDecimal amount, String subscriptionType) {
        // Authenticate with Job Manager to get access token
        String accessToken = authenticate();

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
                .header("Authorization", "Bearer " + accessToken)
                .body(request)
                .retrieve()
                .body(PaymentResponse.class);
    }

    private String authenticate() {
        JMLoginRequest loginRequest = new JMLoginRequest(serviceEmail, servicePassword);

        JMLoginResponse loginResponse = restClient.post()
                .uri("/api/auth/login")
                .body(loginRequest)
                .retrieve()
                .body(JMLoginResponse.class);

        if (loginResponse == null || loginResponse.getAccessToken() == null) {
            throw new IllegalStateException("Failed to authenticate with Job Manager service");
        }

        return loginResponse.getAccessToken();
    }
}

