package com.DEVision.JobApplicant.jwt;

import com.nimbusds.jose.EncryptionMethod;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWEAlgorithm;
import com.nimbusds.jose.JWEHeader;
import com.nimbusds.jose.crypto.RSADecrypter;
import com.nimbusds.jose.crypto.RSAEncrypter;
import com.nimbusds.jwt.EncryptedJWT;
import com.nimbusds.jwt.JWTClaimsSet;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import com.DEVision.JobApplicant.auth.model.AuthModel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JweUtil {
	
	@Autowired
	private KeyStoreManager keyStoreManager;
	
	public String extractEmail(String token) {
		return extractClaim(token, Claims::getSubject);
	}
	
	private Date extractExpiration(String token) {
		return extractClaim(token, Claims::getExpiration);
	}

	public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = extractAllClaims(token);
		return claimsResolver.apply(claims);
	}
	
	private Claims extractAllClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(keyStoreManager.getPublicKey())
				.build()
				.parseClaimsJws(token)
				.getBody();
	}
	
	private boolean isTokenExpired(String token) {
		return extractExpiration(token).before(new Date());
	}
	
	public String generateToken(AuthModel aseUserDetails) {
		Map<String, Object> claims = new HashMap<>();
		System.out.println("UUID " + aseUserDetails.getId());
		claims.put("uuid", aseUserDetails.getId());
		claims.put("role", aseUserDetails.getRole());
		return createToken(claims, aseUserDetails.getEmail());
	}
	
	private String createToken(Map<String, Object> claims, String subject) {
		JWEHeader jweHeader = new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM);

		JWTClaimsSet.Builder claimsSet = new JWTClaimsSet.Builder();
		claimsSet.issuer("ase-cas");
		claimsSet.subject(subject);

		// Add each claim to the ClaimsSet
		claims.forEach((key, value) -> {
			claimsSet.claim(key, value);
		});

		claimsSet.expirationTime(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 5));
		claimsSet.notBeforeTime(new Date());

		claimsSet.jwtID(UUID.randomUUID().toString());

		EncryptedJWT jwt = new EncryptedJWT(jweHeader, claimsSet.build());

		RSAEncrypter encrypter = new RSAEncrypter((RSAPublicKey) keyStoreManager.getPublicKey());

		try {
			jwt.encrypt(encrypter);
		} catch (Exception ex) {
			System.err.println("Error when encrypting token");
			ex.printStackTrace();
		}

		String jwtCipherTxt = jwt.getCipherText().decodeToString();

		return jwt.toString();
	}
	
	public boolean validateToken(String token, AuthModel aseUserDetails) {
		final String email = extractEmail(token);
		
		return (Jwts.parserBuilder().setSigningKey(keyStoreManager.getPublicKey()).build().isSigned(token)
				&& email.equals(aseUserDetails.getEmail())
				&& !isTokenExpired(token)); 
	}

	public String decryptPasswordInJwe(String password) {
		RSADecrypter decrypter = new RSADecrypter((RSAPrivateKey) keyStoreManager.getPrivateKey());
		System.out.println("Private RSA Key: " + ((RSAPrivateKey) keyStoreManager.getPrivateKey()).getPrivateExponent());
		JWEHeader jweHeader = new JWEHeader(JWEAlgorithm.RSA_OAEP_256, EncryptionMethod.A256GCM);

		JWTClaimsSet.Builder claimsSet = new JWTClaimsSet.Builder();

		String decryptedPw = "";

		try {
			EncryptedJWT jwt = EncryptedJWT.parse(password);
			jwt.decrypt(decrypter);
			decryptedPw = jwt.getJWTClaimsSet().getClaim("password").toString();
			System.out.println("Decrypted pw: " + decryptedPw);
		} catch (JOSEException | ParseException e) {
			e.printStackTrace();
		}
		return decryptedPw;
	}
	
}
