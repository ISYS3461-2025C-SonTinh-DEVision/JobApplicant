package com.DEVision.JobApplicant.subscription.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class SubscriptionConfig {

    @Value("${jm.service.url}")
    private String jobManagerBaseUrl;

    @Bean
    public RestClient jobManagerRestClient(RestClient.Builder builder) {
        return builder
                .baseUrl(jobManagerBaseUrl)
                .build();
    }
}

