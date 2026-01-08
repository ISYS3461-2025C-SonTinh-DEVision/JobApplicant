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
    private static final String SUCCESS_URL = "https://ja.devision.sbs/dashboard";
    private static final String CANCEL_URL = "https://ja.devision.sbs/dashboard";

    private final RestClient restClient;

    @Value("${jm.service.email}")
    private String serviceEmail;

    @Value("${jm.service.password}")
    private String servicePassword;

    public JobManagerClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public PaymentResponse processPayment(String email, BigDecimal amount, String subscriptionType) {
        // Authenticate with Job Manager to get access token
        String accessToken = authenticate();

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

