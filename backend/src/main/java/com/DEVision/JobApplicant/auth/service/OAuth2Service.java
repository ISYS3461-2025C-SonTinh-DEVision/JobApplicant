package com.DEVision.JobApplicant.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import com.DEVision.JobApplicant.auth.internal.dto.OAuth2UserInfo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

/**
 * Service to handle OAuth2 authentication with Google
 * Verifies ID tokens and extracts user information
 */
@Service
public class OAuth2Service {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

    /**
     * Verify Google ID token and extract user information
     *
     * @param idToken The Google ID token from the client
     * @return OAuth2UserInfo containing user details
     * @throws Exception if token verification fails
     */
    public OAuth2UserInfo verifyGoogleIdToken(String idToken) throws Exception {
        try {
            // Check if Google OAuth2 is configured
            if (googleClientId == null || googleClientId.isEmpty()) {
                throw new SecurityException("Google OAuth2 is not configured. Please set GOOGLE_CLIENT_ID in environment variables.");
            }

            // Call Google's tokeninfo endpoint to verify the token
            String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            String response = restTemplate.getForObject(tokenInfoUrl, String.class);

            if (response == null) {
                throw new SecurityException("Failed to verify Google ID token");
            }

            // Parse the response
            JsonNode jsonNode = objectMapper.readTree(response);

            // Verify the audience (client ID)
            String aud = jsonNode.get("aud").asText();
            if (!googleClientId.equals(aud)) {
                throw new SecurityException("Invalid token audience");
            }

            // Verify email is verified
            boolean emailVerified = jsonNode.has("email_verified") &&
                                   jsonNode.get("email_verified").asBoolean();

            // Extract user information
            String sub = jsonNode.get("sub").asText(); // Google user ID
            String email = jsonNode.get("email").asText();
            String name = jsonNode.has("name") ? jsonNode.get("name").asText() : "";
            String givenName = jsonNode.has("given_name") ? jsonNode.get("given_name").asText() : "";
            String familyName = jsonNode.has("family_name") ? jsonNode.get("family_name").asText() : "";
            String picture = jsonNode.has("picture") ? jsonNode.get("picture").asText() : "";

            return new OAuth2UserInfo(
                sub,
                email,
                name,
                givenName,
                familyName,
                picture,
                "google",
                emailVerified
            );

        } catch (RestClientException e) {
            throw new SecurityException("Failed to verify Google ID token: " + e.getMessage());
        }
    }

    /**
     * Verify OAuth2 token based on provider
     * Currently supports Google only
     *
     * @param idToken The OAuth2 ID token
     * @param provider The OAuth2 provider (google, facebook, etc.)
     * @return OAuth2UserInfo containing user details
     * @throws Exception if verification fails or provider is not supported
     */
    public OAuth2UserInfo verifyToken(String idToken, String provider) throws Exception {
        if ("google".equalsIgnoreCase(provider)) {
            return verifyGoogleIdToken(idToken);
        } else {
            throw new UnsupportedOperationException("OAuth2 provider not supported: " + provider);
        }
    }

    /**
     * Generate Google OAuth2 authorization URL
     * Used for Authorization Code Flow
     *
     * @return Map containing the authorization URL
     */
    public Map<String, String> getGoogleAuthUrl() {
        if (googleClientId == null || googleClientId.isEmpty()) {
            throw new SecurityException("Google OAuth2 is not configured. Please set GOOGLE_CLIENT_ID in environment variables.");
        }

        String redirectUri = frontendBaseUrl + "/auth/callback/google";
        String scope = "email profile openid";

        String authUrl = GOOGLE_AUTH_URL +
                "?client_id=" + googleClientId +
                "&redirect_uri=" + redirectUri +
                "&scope=" + scope +
                "&response_type=code" +
                "&access_type=offline" +
                "&prompt=consent";

        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        return response;
    }

    /**
     * Exchange Google authorization code for access token and get user info
     * Used for Authorization Code Flow
     *
     * @param code Authorization code from Google
     * @return OAuth2UserInfo containing user details
     * @throws Exception if token exchange or user info retrieval fails
     */
    public OAuth2UserInfo exchangeCodeForUserInfo(String code) throws Exception {
        try {
            if (googleClientId == null || googleClientId.isEmpty() ||
                googleClientSecret == null || googleClientSecret.isEmpty()) {
                throw new SecurityException("Google OAuth2 is not configured properly.");
            }

            String redirectUri = frontendBaseUrl + "/auth/callback/google";

            // Step 1: Exchange authorization code for access token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("code", code);
            requestBody.add("client_id", googleClientId);
            requestBody.add("client_secret", googleClientSecret);
            requestBody.add("redirect_uri", redirectUri);
            requestBody.add("grant_type", "authorization_code");

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
            String tokenResponse = restTemplate.postForObject(GOOGLE_TOKEN_URL, request, String.class);

            if (tokenResponse == null) {
                throw new SecurityException("Failed to exchange authorization code for token");
            }

            JsonNode tokenJson = objectMapper.readTree(tokenResponse);
            String accessToken = tokenJson.get("access_token").asText();

            // Step 2: Get user info using access token
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            HttpEntity<String> userInfoRequest = new HttpEntity<>(userInfoHeaders);

            String userInfoResponse = restTemplate.postForObject(
                GOOGLE_USERINFO_URL,
                userInfoRequest,
                String.class
            );

            if (userInfoResponse == null) {
                throw new SecurityException("Failed to get user info from Google");
            }

            JsonNode userInfoJson = objectMapper.readTree(userInfoResponse);

            // Extract user information
            String sub = userInfoJson.get("sub").asText();
            String email = userInfoJson.get("email").asText();
            boolean emailVerified = userInfoJson.has("email_verified") &&
                                   userInfoJson.get("email_verified").asBoolean();
            String name = userInfoJson.has("name") ? userInfoJson.get("name").asText() : "";
            String givenName = userInfoJson.has("given_name") ? userInfoJson.get("given_name").asText() : "";
            String familyName = userInfoJson.has("family_name") ? userInfoJson.get("family_name").asText() : "";
            String picture = userInfoJson.has("picture") ? userInfoJson.get("picture").asText() : "";

            return new OAuth2UserInfo(
                sub,
                email,
                name,
                givenName,
                familyName,
                picture,
                "google",
                emailVerified
            );

        } catch (RestClientException e) {
            throw new SecurityException("Failed to exchange code for user info: " + e.getMessage());
        }
    }
}
