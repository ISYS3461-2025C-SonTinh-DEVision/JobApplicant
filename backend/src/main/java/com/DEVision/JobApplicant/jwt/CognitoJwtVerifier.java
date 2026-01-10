package com.DEVision.JobApplicant.jwt;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.text.ParseException;
import java.util.Date;

/**
 * Verifies AWS Cognito access tokens (JWT) for system-to-system communication.
 *
 * This is used by SystemAuthFilter to authenticate external systems (e.g. JM)
 * using a shared Cognito client-credentials flow.
 */
@Component
public class CognitoJwtVerifier {

    private final ConfigurableJWTProcessor<SecurityContext> jwtProcessor;
    private final String expectedIssuer;
    private final String expectedClientId;
    private final String requiredScope;

    public CognitoJwtVerifier(
            @Value("${cognito.region}") String region,
            @Value("${cognito.user-pool-id}") String userPoolId,
            @Value("${cognito.client-id}") String clientId,
            @Value("${cognito.required-scope}") String requiredScope
    ) throws Exception {

        this.expectedIssuer = "https://cognito-idp." + region + ".amazonaws.com/" + userPoolId;
        this.expectedClientId = clientId;
        this.requiredScope = requiredScope;

        String jwkSetUrl = expectedIssuer + "/.well-known/jwks.json";
        JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(new URL(jwkSetUrl));

        this.jwtProcessor = new DefaultJWTProcessor<>();
        JWSVerificationKeySelector<SecurityContext> keySelector =
                new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, keySource);
        this.jwtProcessor.setJWSKeySelector(keySelector);
    }

    /**
     * Validate a Cognito access token for system-to-system communication.
     *
     * Checks:
     * - Signature (via JWKS)
     * - Expiration
     * - Issuer (user pool)
     * - client_id
     * - required scope
     * - token_use == "access" (if present)
     */
    public boolean validateAccessToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                System.err.println("Cognito token validation failed: Token is null or empty");
                return false;
            }

            SignedJWT signedJwt = SignedJWT.parse(token);
            System.out.println("Cognito token parsed successfully");

            // Process token (verifies signature and basic structure)
            var claims = jwtProcessor.process(signedJwt, null);
            System.out.println("Cognito token signature verified successfully");

            // Expiration
            Date exp = claims.getExpirationTime();
            Date now = new Date();
            if (exp == null) {
                System.err.println("Cognito token validation failed: No expiration time in token");
                return false;
            }
            if (exp.before(now)) {
                System.err.println("Cognito token validation failed: Token expired. Exp: " + exp + ", Now: " + now);
                return false;
            }
            System.out.println("Cognito token expiration check passed. Expires at: " + exp);

            // Issuer
            String actualIssuer = claims.getIssuer();
            if (actualIssuer == null) {
                System.err.println("Cognito token validation failed: No issuer in token");
                return false;
            }
            if (!expectedIssuer.equals(actualIssuer)) {
                System.err.println("Cognito token validation failed: Issuer mismatch. Expected: " + expectedIssuer + ", Actual: " + actualIssuer);
                return false;
            }
            System.out.println("Cognito token issuer check passed. Issuer: " + actualIssuer);

            // Client ID (for client_credentials flow)
            Object clientIdClaim = claims.getClaim("client_id");
            if (clientIdClaim == null) {
                System.err.println("Cognito token validation failed: No client_id claim in token");
                return false;
            }
            String actualClientId = clientIdClaim.toString();
            if (!expectedClientId.equals(actualClientId)) {
                System.err.println("Cognito token validation failed: Client ID mismatch. Expected: " + expectedClientId + ", Actual: " + actualClientId);
                return false;
            }
            System.out.println("Cognito token client_id check passed. Client ID: " + actualClientId);

            // Scope (space-separated string in Cognito access tokens)
            String scope = (String) claims.getClaim("scope");
            if (requiredScope != null && !requiredScope.isBlank()) {
                if (scope == null || scope.isBlank()) {
                    System.err.println("Cognito token validation failed: No scope in token. Required scope: " + requiredScope);
                    return false;
                }
                if (!scope.contains(requiredScope)) {
                    System.err.println("Cognito token validation failed: Scope mismatch. Required: " + requiredScope + ", Actual: " + scope);
                    return false;
                }
                System.out.println("Cognito token scope check passed. Scope: " + scope);
            }

            // Ensure this is an access token (if token_use available)
            Object tokenUse = claims.getClaim("token_use");
            if (tokenUse != null && !"access".equals(tokenUse.toString())) {
                System.err.println("Cognito token validation failed: Token use is not 'access'. Actual: " + tokenUse);
                return false;
            }
            if (tokenUse != null) {
                System.out.println("Cognito token token_use check passed. Token use: " + tokenUse);
            }

            System.out.println("Cognito token validation successful!");
            return true;
        } catch (ParseException e) {
            System.err.println("Failed to parse Cognito token: " + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("Failed to validate Cognito token: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}


