package com.DEVision.JobApplicant.subscription.client;

import java.math.BigDecimal;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.DEVision.JobApplicant.subscription.dto.PaymentRequest;
import com.DEVision.JobApplicant.subscription.dto.PaymentResponse;

@Component
public class JobManagerClient {

    private final RestClient restClient;

    public JobManagerClient(RestClient restClient) {
        this.restClient = restClient;
    }

    public PaymentResponse processPayment(String userId, BigDecimal amount) {
        PaymentRequest request = new PaymentRequest(userId, amount, "VND");

        return restClient.post()
                .uri("/payments")
                .body(request)
                .retrieve()
                .body(PaymentResponse.class);
    }
}

