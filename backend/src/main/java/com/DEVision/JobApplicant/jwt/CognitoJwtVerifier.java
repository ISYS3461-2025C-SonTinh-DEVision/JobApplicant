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
            SignedJWT signedJwt = SignedJWT.parse(token);

            // Process token (verifies signature and basic structure)
            var claims = jwtProcessor.process(signedJwt, null);

            // Expiration
            Date exp = claims.getExpirationTime();
            if (exp == null || exp.before(new Date())) {
                return false;
            }

            // Issuer
            if (!expectedIssuer.equals(claims.getIssuer())) {
                return false;
            }

            // Client ID (for client_credentials flow)
            Object clientIdClaim = claims.getClaim("client_id");
            if (clientIdClaim == null || !expectedClientId.equals(clientIdClaim.toString())) {
                return false;
            }

            // Scope (space-separated string in Cognito access tokens)
            String scope = (String) claims.getClaim("scope");
            if (requiredScope != null && !requiredScope.isBlank()) {
                if (scope == null || !scope.contains(requiredScope)) {
                    return false;
                }
            }

            // Ensure this is an access token (if token_use available)
            Object tokenUse = claims.getClaim("token_use");
            if (tokenUse != null && !"access".equals(tokenUse.toString())) {
                return false;
            }

            return true;
        } catch (ParseException e) {
            System.err.println("Failed to parse Cognito token: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Failed to validate Cognito token: " + e.getMessage());
            return false;
        }
    }
}


