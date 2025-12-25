package com.DEVision.JobApplicant.jwt;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.crypto.RSADecrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.text.ParseException;
import java.util.Date;

/**
 * Utility for verifying JWE tokens from external systems (e.g., Job Manager)
 * 
 * IMPORTANT: For JWE tokens encrypted with external system's keys, we cannot decrypt them
 * without their private key. Therefore, we use API-based verification (calling JM's verify-token endpoint).
 * 
 * If JM uses JWS (signed) tokens instead, we can verify with their public key.
 */
@Component
public class JweTokenVerifier {
	
	@Autowired
	private KeyStoreManager keyStoreManager;
	
	/**
	 * Verify JWE token from Job Manager
	 * 
	 * NOTE: If JM encrypts JWE tokens with their own keys, we cannot decrypt them.
	 * This method is for the special case where JM encrypts with OUR public key
	 * (which would be a token specifically for our system, not their internal token).
	 * 
	 * For normal system-to-system auth, use API-based verification instead.
	 * 
	 * @param token JWE token string from JM
	 * @param expectedIssuer Expected issuer claim (e.g., "JOB_MANAGER_SYSTEM")
	 * @param expectedSystemId Expected system identifier in token claims
	 * @return TokenVerificationResult with validation status and claims
	 */
	public TokenVerificationResult verifyJobManagerToken(String token, String expectedIssuer, String expectedSystemId) {
		try {
			// Parse the JWE token
			EncryptedJWT jwt = EncryptedJWT.parse(token);
			
			// Try to decrypt using our private key (only works if JM encrypted with our public key)
			// This is NOT the normal case - normally JM uses their own keys
			RSADecrypter decrypter = new RSADecrypter((RSAPrivateKey) keyStoreManager.getPrivateKey());
			jwt.decrypt(decrypter);
			
			// Extract claims
			JWTClaimsSet claims = jwt.getJWTClaimsSet();
			
			// Verify expiration
			Date expiration = claims.getExpirationTime();
			if (expiration == null || expiration.before(new Date())) {
				return TokenVerificationResult.invalid("Token has expired");
			}
			
			// Verify not before
			Date notBefore = claims.getNotBeforeTime();
			if (notBefore != null && notBefore.after(new Date())) {
				return TokenVerificationResult.invalid("Token not yet valid");
			}
			
			// Verify issuer
			String issuer = claims.getIssuer();
			if (expectedIssuer != null && !expectedIssuer.equals(issuer)) {
				return TokenVerificationResult.invalid("Invalid issuer: " + issuer);
			}
			
			// Verify system ID (if present in claims)
			if (expectedSystemId != null) {
				String systemId = (String) claims.getClaim("systemId");
				if (systemId == null || !expectedSystemId.equals(systemId)) {
					return TokenVerificationResult.invalid("Invalid system ID");
				}
			}
			
			// Verify token type (should be "system" or "service")
			String tokenType = (String) claims.getClaim("type");
			if (tokenType == null || (!"system".equals(tokenType) && !"service".equals(tokenType))) {
				return TokenVerificationResult.invalid("Invalid token type: " + tokenType);
			}
			
			// All checks passed
			return TokenVerificationResult.valid(claims);
			
		} catch (ParseException e) {
			return TokenVerificationResult.invalid("Failed to parse token: " + e.getMessage());
		} catch (JOSEException e) {
			return TokenVerificationResult.invalid("Failed to decrypt token: " + e.getMessage());
		} catch (Exception e) {
			return TokenVerificationResult.invalid("Token verification failed: " + e.getMessage());
		}
	}
	
	/**
	 * Verify JWE token using external system's public key
	 * Use this if JM encrypts tokens with their own key
	 * 
	 * @param token JWE token string
	 * @param externalPublicKey External system's RSA public key
	 * @param expectedIssuer Expected issuer claim
	 * @param expectedSystemId Expected system identifier
	 * @return TokenVerificationResult
	 */
	public TokenVerificationResult verifyTokenWithExternalKey(
			String token, 
			RSAPublicKey externalPublicKey,
			String expectedIssuer, 
			String expectedSystemId) {
		// Note: For JWE, we need the private key to decrypt
		// If JM encrypts with their own key, we need their private key (not practical)
		// OR they encrypt with our public key (use verifyJobManagerToken instead)
		// This method assumes a different key exchange mechanism
		
		// For now, this is a placeholder - you'd need JM's private key or a shared key
		return TokenVerificationResult.invalid("External key verification not yet implemented");
	}
	
	/**
	 * Result of token verification
	 */
	public static class TokenVerificationResult {
		private final boolean valid;
		private final String message;
		private final JWTClaimsSet claims;
		private final String systemId;
		private final String subject;
		
		private TokenVerificationResult(boolean valid, String message, JWTClaimsSet claims) {
			this.valid = valid;
			this.message = message;
			this.claims = claims;
			this.systemId = claims != null ? (String) claims.getClaim("systemId") : null;
			this.subject = claims != null ? claims.getSubject() : null;
		}
		
		public static TokenVerificationResult valid(JWTClaimsSet claims) {
			return new TokenVerificationResult(true, "Token is valid", claims);
		}
		
		public static TokenVerificationResult invalid(String message) {
			return new TokenVerificationResult(false, message, null);
		}
		
		public boolean isValid() {
			return valid;
		}
		
		public String getMessage() {
			return message;
		}
		
		public JWTClaimsSet getClaims() {
			return claims;
		}
		
		public String getSystemId() {
			return systemId;
		}
		
		public String getSubject() {
			return subject;
		}
	}
}

