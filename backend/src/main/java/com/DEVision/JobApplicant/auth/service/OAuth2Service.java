package com.DEVision.JobApplicant.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import com.DEVision.JobApplicant.auth.internal.dto.OAuth2UserInfo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Service to handle OAuth2 authentication with Google
 * Verifies ID tokens and extracts user information
 */
@Service
public class OAuth2Service {

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

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
}
