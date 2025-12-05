package com.DEVision.JobApplicant.common.service;

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
}
