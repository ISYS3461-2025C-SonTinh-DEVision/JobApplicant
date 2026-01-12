package com.DEVision.JobApplicant.auth.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.DEVision.JobApplicant.common.redis.RedisService;

/**
 * Service for obtaining and caching Cognito OAuth2 access tokens (client_credentials flow).
 * Used when JA system calls JM system (or other external systems) that require Cognito auth.
 * 
 * This service is shared across multiple modules:
 * - jobManager (jobpost, company) - for job post and company API calls
 * - subscription - for payment processing API calls
 * 
 * Tokens are cached in Redis to avoid re-authenticating on every request.
 */
@Service
public class CognitoTokenService {

    private static final String REDIS_TOKEN_KEY = "cognito:system_token";
    
    // Cache token for slightly less than actual expiry to avoid edge cases
    private static final long TOKEN_CACHE_BUFFER_SECONDS = 60;

    @Value("${cognito.token-url:https://ap-southeast-2r9u2ssjaz.auth.ap-southeast-2.amazoncognito.com/oauth2/token}")
    private String tokenUrl;

    @Value("${cognito.client-id}")
    private String clientId;

    @Value("${cognito.client-secret:}")
    private String clientSecret;

    @Value("${cognito.required-scope:default-m2m-resource-server-wti-ej/read}")
    private String scope;

    // Note: For custom claims in Cognito tokens (like subsystem), a Pre-Token Generation
    // Lambda trigger must be configured in AWS Cognito. The trigger can identify the
    // calling system by client_id and add appropriate claims (e.g., subsystem: "APPLICANT")

    @Autowired
    private RedisService redisService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get a valid Cognito access token.
     * Returns cached token from Redis if still valid, otherwise fetches a new one.
     * 
     * @return Access token string (without "Bearer " prefix)
     * @throws RuntimeException if token fetch fails
     */
    public String getAccessToken() {
        // Try to get cached token from Redis (handle Redis unavailability gracefully)
        try {
            String cachedToken = redisService.getCachedValue(REDIS_TOKEN_KEY);
            if (cachedToken != null && !cachedToken.isEmpty()) {
                System.out.println("Using cached Cognito token from Redis");
                return cachedToken;
            }
        } catch (Exception redisException) {
            System.out.println("Warning: Redis unavailable, skipping cache lookup: " + redisException.getMessage());
        }

        // Fetch new token from Cognito
        System.out.println("Fetching new Cognito token from: " + tokenUrl);
        System.out.println("Cognito token: " + fetchAndCacheToken());
        return fetchAndCacheToken();
    }

    /**
     * Force refresh the token (useful if token is rejected by target system)
     * 
     * @return New access token string
     */
    public String refreshToken() {
        try {
            redisService.deleteCachedValue(REDIS_TOKEN_KEY);
        } catch (Exception redisException) {
            System.out.println("Warning: Redis unavailable, skipping cache deletion: " + redisException.getMessage());
        }
        return fetchAndCacheToken();
    }

    /**
     * Fetch token from Cognito and cache in Redis
     */
    private String fetchAndCacheToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");
            body.add("client_id", clientId);
            if (clientSecret != null && !clientSecret.isEmpty()) {
                body.add("client_secret", clientSecret);
            }
            body.add("scope", scope);
            // Note: Custom claims (like subsystem) require a Pre-Token Generation Lambda
            // trigger in AWS Cognito. The trigger identifies the client by client_id.

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                tokenUrl,
                HttpMethod.POST,
                request,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                CognitoTokenResponse tokenResponse = objectMapper.readValue(
                    response.getBody(), 
                    CognitoTokenResponse.class
                );

                String accessToken = tokenResponse.getAccessToken();
                long expiresIn = tokenResponse.getExpiresIn();

                // Cache in Redis with TTL slightly less than actual expiry (handle Redis unavailability)
                long cacheTtlMinutes = Math.max((expiresIn - TOKEN_CACHE_BUFFER_SECONDS) / 60, 1);
                try {
                    redisService.cacheValue(REDIS_TOKEN_KEY, accessToken, cacheTtlMinutes);
                    System.out.println("Cognito token fetched and cached for " + cacheTtlMinutes + " minutes");
                } catch (Exception redisException) {
                    System.out.println("Warning: Redis unavailable, token not cached: " + redisException.getMessage());
                    System.out.println("Cognito token fetched successfully (not cached)");
                }
                return accessToken;
            }

            throw new RuntimeException("Failed to fetch Cognito token: " + response.getStatusCode());

        } catch (Exception e) {
            System.err.println("Error fetching Cognito token: " + e.getMessage());
            throw new RuntimeException("Failed to fetch Cognito token", e);
        }
    }

    /**
     * Get Authorization header value ready to use
     * 
     * @return "Bearer <access_token>"
     */
    public String getAuthorizationHeader() {
        return "Bearer " + getAccessToken();
    }

    /**
     * Response from Cognito token endpoint
     */
    private static class CognitoTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;

        @JsonProperty("expires_in")
        private long expiresIn;

        @JsonProperty("token_type")
        private String tokenType;

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public long getExpiresIn() {
            return expiresIn;
        }

        public void setExpiresIn(long expiresIn) {
            this.expiresIn = expiresIn;
        }

        public String getTokenType() {
            return tokenType;
        }

        public void setTokenType(String tokenType) {
            this.tokenType = tokenType;
        }
    }
}

