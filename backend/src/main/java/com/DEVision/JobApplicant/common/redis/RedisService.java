package com.DEVision.JobApplicant.common.redis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Redis service for token blacklist management, rate limiting, and caching
 */
@Service
public class RedisService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // ==================== TOKEN BLACKLIST OPERATIONS ====================

    /**
     * Add a token to the blacklist (for logout/revocation)
     * @param token JWT token to blacklist
     * @param expirationMinutes How long to keep in blacklist (match token expiry)
     */
    public void blacklistToken(String token, long expirationMinutes) {
        String key = "blacklist:" + token;
        redisTemplate.opsForValue().set(key, "revoked", expirationMinutes, TimeUnit.MINUTES);
    }

    /**
     * Check if a token is blacklisted
     * @param token JWT token to check
     * @return true if token is blacklisted (revoked), false otherwise
     */
    public boolean isTokenBlacklisted(String token) {
        String key = "blacklist:" + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Remove a token from blacklist (rarely used, mainly for testing)
     * @param token JWT token to remove from blacklist
     */
    public void removeTokenFromBlacklist(String token) {
        String key = "blacklist:" + token;
        redisTemplate.delete(key);
    }

    // ==================== RATE LIMITING OPERATIONS ====================

    /**
     * Check if a login attempt is allowed for the given email
     * Implements brute-force protection: max 5 attempts in 60 seconds
     *
     * @param email User email address
     * @return true if attempt is allowed, false if rate limit exceeded
     */
    public boolean allowLoginAttempt(String email) {
        String key = "login_attempts:" + email;
        Long attempts = redisTemplate.opsForValue().increment(key);

        if (attempts == null) {
            attempts = 0L;
        }

        // First attempt - set expiration window
        if (attempts == 1) {
            redisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }

        // Allow up to 5 attempts
        return attempts <= 5;
    }

    /**
     * Reset login attempts for a user (called on successful login)
     * @param email User email address
     */
    public void resetLoginAttempts(String email) {
        String key = "login_attempts:" + email;
        redisTemplate.delete(key);
    }

    /**
     * Get current number of login attempts for a user
     * @param email User email address
     * @return Number of failed attempts in current window
     */
    public long getLoginAttempts(String email) {
        String key = "login_attempts:" + email;
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? Long.parseLong(value) : 0;
    }

    // ==================== GENERIC CACHE OPERATIONS ====================

    /**
     * Store a value in cache with expiration
     * @param key Cache key
     * @param value Value to store
     * @param expirationMinutes Time to live in minutes
     */
    public void cacheValue(String key, String value, long expirationMinutes) {
        redisTemplate.opsForValue().set(key, value, expirationMinutes, TimeUnit.MINUTES);
    }

    /**
     * Get a cached value
     * @param key Cache key
     * @return Cached value or null if not found/expired
     */
    public String getCachedValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Delete a cached value
     * @param key Cache key
     */
    public void deleteCachedValue(String key) {
        redisTemplate.delete(key);
    }

    /**
     * Check if a key exists in cache
     * @param key Cache key
     * @return true if key exists, false otherwise
     */
    public boolean exists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    // ==================== RESEND ACTIVATION RATE LIMITING ====================

    /**
     * Check if resend activation email is allowed for the given email
     * Implements rate limiting: 1 request per 60 seconds per email
     *
     * @param email User email address
     * @return true if resend is allowed, false if rate limit exceeded
     */
    public boolean allowResendActivation(String email) {
        String key = "resend_activation:" + email;
        
        // Check if cooldown is active
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            return false;
        }
        
        // Set cooldown for 60 seconds
        redisTemplate.opsForValue().set(key, String.valueOf(System.currentTimeMillis()), 60, TimeUnit.SECONDS);
        return true;
    }

    /**
     * Get remaining cooldown time for resend activation
     * @param email User email address
     * @return Remaining seconds until next resend is allowed, 0 if allowed now
     */
    public long getRemainingResendCooldown(String email) {
        String key = "resend_activation:" + email;
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : 0;
    }

    // ==================== OTP OPERATIONS ====================

    /**
     * Store OTP for email verification
     * @param email Email address
     * @param otp 6-digit OTP code
     * @param expirationMinutes Time to live in minutes (default 5)
     */
    public void storeOtp(String email, String otp, long expirationMinutes) {
        String key = "otp:" + email.toLowerCase();
        redisTemplate.opsForValue().set(key, otp, expirationMinutes, TimeUnit.MINUTES);
    }

    /**
     * Get stored OTP for email
     * @param email Email address
     * @return OTP code or null if not found/expired
     */
    public String getOtp(String email) {
        String key = "otp:" + email.toLowerCase();
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Verify OTP for email
     * @param email Email address
     * @param otp OTP code to verify
     * @return true if OTP matches, false otherwise
     */
    public boolean verifyOtp(String email, String otp) {
        String storedOtp = getOtp(email);
        return storedOtp != null && storedOtp.equals(otp);
    }

    /**
     * Delete OTP after successful verification
     * @param email Email address
     */
    public void deleteOtp(String email) {
        String key = "otp:" + email.toLowerCase();
        redisTemplate.delete(key);
    }

    /**
     * Check if OTP rate limit is exceeded (1 OTP per 60 seconds)
     * @param email Email address
     * @return true if allowed, false if rate limit exceeded
     */
    public boolean allowOtpSend(String email) {
        String key = "otp_rate:" + email.toLowerCase();
        
        if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            return false;
        }
        
        redisTemplate.opsForValue().set(key, String.valueOf(System.currentTimeMillis()), 60, TimeUnit.SECONDS);
        return true;
    }

    /**
     * Get remaining cooldown for OTP send
     * @param email Email address
     * @return Remaining seconds until next OTP can be sent
     */
    public long getRemainingOtpCooldown(String email) {
        String key = "otp_rate:" + email.toLowerCase();
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        return ttl != null && ttl > 0 ? ttl : 0;
    }

    // ==================== SSO VERIFICATION TOKEN OPERATIONS ====================

    /**
     * Store SSO verification token for user
     * Used when SSO user verifies ownership via Google login for email change
     * @param userId User ID
     * @param token Verification token
     * @param expirationMinutes Time to live in minutes (default 10)
     */
    public void storeSsoVerificationToken(String userId, String token, long expirationMinutes) {
        String key = "sso_verify:" + userId;
        redisTemplate.opsForValue().set(key, token, expirationMinutes, TimeUnit.MINUTES);
    }

    /**
     * Verify SSO verification token for user
     * @param userId User ID
     * @param token Token to verify
     * @return true if token matches, false otherwise
     */
    public boolean verifySsoVerificationToken(String userId, String token) {
        String key = "sso_verify:" + userId;
        String storedToken = redisTemplate.opsForValue().get(key);
        return storedToken != null && storedToken.equals(token);
    }

    /**
     * Delete SSO verification token after use
     * @param userId User ID
     */
    public void deleteSsoVerificationToken(String userId) {
        String key = "sso_verify:" + userId;
        redisTemplate.delete(key);
    }
}

