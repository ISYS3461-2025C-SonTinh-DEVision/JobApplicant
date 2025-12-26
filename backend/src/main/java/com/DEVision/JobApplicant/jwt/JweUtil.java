package com.DEVision.JobApplicant.jwt;

import com.nimbusds.jose.EncryptionMethod;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWEAlgorithm;
import com.nimbusds.jose.JWEHeader;
import com.nimbusds.jose.crypto.RSADecrypter;
import com.nimbusds.jose.crypto.RSAEncrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class JweUtil {
	
	@Autowired
	private KeyStoreManager keyStoreManager;
	
	@Value("${jwt.access.expiration:86400000}")  // 24 hours default
	private long accessTokenExpiration;
	
	@Value("${jwt.refresh.expiration:604800000}")  // 7 days default
	private long refreshTokenExpiration;
	
	/**
	 * Generate access token for user
	 */
	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles", userDetails.getAuthorities().toString());
		return createToken(claims, userDetails.getUsername(), accessTokenExpiration);
	}
	
	/**
	 * Generate refresh token for user
	 */
	public String generateRefreshToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("type", "refresh");
		claims.put("tokenId", UUID.randomUUID().toString());
		return createToken(claims, userDetails.getUsername(), refreshTokenExpiration);
	}
	
	/**
	 * Create encrypted JWE token
	 */
	private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
		// JWE Header: RSA-OAEP-256 for key encryption, A256GCM for content encryption
		JWEHeader jweHeader = new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM);

		// Build claims set
		JWTClaimsSet.Builder claimsSetBuilder = new JWTClaimsSet.Builder();
		claimsSetBuilder.issuer("JobApplicant");
		claimsSetBuilder.subject(subject);
		claimsSetBuilder.issueTime(new Date());
		claimsSetBuilder.expirationTime(new Date(System.currentTimeMillis() + expirationTime));
		claimsSetBuilder.notBeforeTime(new Date());
		claimsSetBuilder.jwtID(UUID.randomUUID().toString());

		// Add custom claims
		claims.forEach(claimsSetBuilder::claim);

		// Create encrypted JWT
		EncryptedJWT jwt = new EncryptedJWT(jweHeader, claimsSetBuilder.build());

		// Encrypt with public key
		RSAEncrypter encrypter = new RSAEncrypter((RSAPublicKey) keyStoreManager.getPublicKey());

		try {
			jwt.encrypt(encrypter);
		} catch (JOSEException ex) {
			System.err.println("Error when encrypting token");
			ex.printStackTrace();
			throw new RuntimeException("Failed to encrypt token", ex);
		}

		return jwt.serialize();
	}
	
	/**
	 * Decrypt and extract all claims from JWE token
	 */
	private JWTClaimsSet extractAllClaims(String token) {
		try {
			EncryptedJWT jwt = EncryptedJWT.parse(token);
			RSADecrypter decrypter = new RSADecrypter((RSAPrivateKey) keyStoreManager.getPrivateKey());
			jwt.decrypt(decrypter);
			return jwt.getJWTClaimsSet();
		} catch (ParseException | JOSEException e) {
			throw new RuntimeException("Failed to decrypt token", e);
		}
	}
	
	/**
	 * Extract username (subject) from token
	 */
	public String extractUsername(String token) {
		return extractAllClaims(token).getSubject();
	}
	
	/**
	 * Extract expiration date from token
	 */
	private Date extractExpiration(String token) {
		return extractAllClaims(token).getExpirationTime();
	}
	
	/**
	 * Check if token is expired
	 */
	private boolean isTokenExpired(String token) {
		Date expiration = extractExpiration(token);
		return expiration != null && expiration.before(new Date());
	}
	
	/**
	 * Verify JWE token (decrypt and check expiration)
	 * Returns true if token is valid and not expired
	 */
	public boolean verifyJweToken(String token) {
		try {
			// Parse and decrypt the JWE token
			EncryptedJWT jwt = EncryptedJWT.parse(token);
			RSADecrypter decrypter = new RSADecrypter((RSAPrivateKey) keyStoreManager.getPrivateKey());
			jwt.decrypt(decrypter);
			
			// Check expiration
			JWTClaimsSet claims = jwt.getJWTClaimsSet();
			Date expiration = claims.getExpirationTime();
			
			if (expiration == null || expiration.before(new Date())) {
				return false;
			}
			
			return true;
		} catch (Exception e) {
			System.err.println("JWE token verification failed: " + e.getMessage());
			return false;
		}
	}
	
	/**
	 * Validate token against user details
	 */
	public boolean validateToken(String token, UserDetails userDetails) {
		try {
			final String username = extractUsername(token);
			return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
		} catch (Exception e) {
			return false;
		}
	}
	
	/**
	 * Check if token is a refresh token
	 */
	public boolean isRefreshToken(String token) {
		try {
			JWTClaimsSet claims = extractAllClaims(token);
			return "refresh".equals(claims.getClaim("type"));
		} catch (Exception e) {
			return false;
		}
	}

	/**
	 * Decrypt password from JWE (utility method for encrypted passwords)
	 */
	public String decryptPasswordInJwe(String encryptedPassword) {
		RSADecrypter decrypter = new RSADecrypter((RSAPrivateKey) keyStoreManager.getPrivateKey());

		try {
			EncryptedJWT jwt = EncryptedJWT.parse(encryptedPassword);
			jwt.decrypt(decrypter);
			return jwt.getJWTClaimsSet().getClaim("password").toString();
		} catch (JOSEException | ParseException e) {
			e.printStackTrace();
			throw new RuntimeException("Failed to decrypt password", e);
		}
	}
}
