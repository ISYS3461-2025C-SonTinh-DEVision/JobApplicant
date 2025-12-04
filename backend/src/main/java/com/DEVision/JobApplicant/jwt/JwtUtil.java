package com.DEVision.JobApplicant.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

	@Autowired
	private KeyStoreManager keyStoreManager;
	
	@Value("${jwt.access.expiration:86400000}")  // 5 minutes default
	private long accessTokenExpiration;
	
	@Value("${jwt.refresh.expiration:86400000}")  // 24 hours default
	private long refreshTokenExpiration;
	
	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("roles", userDetails.getAuthorities());

		return createToken(claims, userDetails.getUsername(), accessTokenExpiration);
	}
	
	public String generateRefreshToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("type", "refresh");
		claims.put("tokenId", UUID.randomUUID().toString());

		return createToken(claims, userDetails.getUsername(), refreshTokenExpiration);
	}
	
	private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
		String jwt = Jwts.builder()
				.setClaims(claims)
				.setSubject(subject)
				.setIssuer("SpringAuthorizationDemo")
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + expirationTime))
				.signWith(keyStoreManager.getPrivateKey(), SignatureAlgorithm.RS256)
				.compact();
		return jwt;
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}

	public String extractUsername(String token) {
		return extractClaim(token, Claims::getSubject);
	}

	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	private Claims extractAllClaims(String token)  {
		return loadJwtParser()
				.parseClaimsJws(token)
				.getBody();
	}

	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}

	private JwtParser loadJwtParser() {
		return Jwts.parserBuilder()
				.setSigningKey(keyStoreManager.getPublicKey())
				.build();
	}

	public boolean validateToken(String token, UserDetails userDetails) {
		final String username = extractUsername(token);
		return (loadJwtParser().isSigned(token)
				&& username.equals(userDetails.getUsername())
				&& !isTokenExpired(token));
	}

	public boolean verifyJwtSignature(String token) {
		try {
			return (
				loadJwtParser().isSigned(token)
					&& !isTokenExpired(token)
			);
		} catch (Exception e) {
			return false;
		}
	}
	
	public boolean isRefreshToken(String token) {
		try {
			Claims claims = extractAllClaims(token);
			return "refresh".equals(claims.get("type"));
		} catch (Exception e) {
			return false;
		}
	}
}
