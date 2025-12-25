# JWE Token Verification for Job Manager Integration

## Overview

This document explains how to verify JWE tokens from Job Manager (JM) when they call your API.

## Important Understanding

**Job Manager generates tokens with their own keys for their own system.** When a user logs into JM, they get a token encrypted with JM's keys. This token is used within JM's system.

When JM calls your API, they send **their token** (encrypted with their keys). **You cannot decrypt JWE tokens encrypted with JM's keys** without their private key (which they won't share).

## Solution: API-Based Verification

Since we cannot decrypt JM's JWE tokens directly, we use **API-based verification**:

1. JM sends their token in `X-System-Authorization` header
2. Your system calls JM's verify-token API endpoint
3. JM verifies the token (they can decrypt it with their private key)
4. JM returns verification result
5. Your system trusts JM's response

## Configuration

### application.yml

```yaml
system:
  auth:
    job-manager:
      # REQUIRED: JM's verify-token API endpoint
      verify-token-url: ${JOB_MANAGER_VERIFY_TOKEN_URL:http://job-manager-api/api/system/verify-token}
      
      # Optional: Local verification (only works if JM encrypted with YOUR public key)
      # This is NOT the normal case - set to false (default)
      verify-locally: false
      
      # Only used for local verification (if enabled)
      expected-issuer: JOB_MANAGER_SYSTEM
      expected-system-id: JOB_MANAGER_SYSTEM
```

### Environment Variables

```bash
# REQUIRED: JM's verify-token API URL
JOB_MANAGER_VERIFY_TOKEN_URL=http://job-manager-api/api/system/verify-token

# Optional: Enable local verification (default: false)
# Only works if JM encrypted token with YOUR public key
JOB_MANAGER_VERIFY_LOCALLY=false
```

## How It Works

### Token Flow

```
1. User logs into JM → Gets JWE token (encrypted with JM's keys)
2. JM calls your API → Sends token in X-System-Authorization header
3. Your SystemAuthFilter intercepts
4. Your system calls JM's verify-token API with the token
5. JM verifies token (decrypts with their private key)
6. JM returns: { valid: true, systemId: "JOB_MANAGER_SYSTEM" }
7. Your system trusts JM's response → Sets ROLE_SYSTEM authentication
8. Request proceeds to controller
```

### What You Need from Job Manager

1. **JM's verify-token API endpoint URL**
   - Example: `http://job-manager-api/api/system/verify-token`
   - This endpoint should accept: `Authorization: Bearer <token>`
   - Should return: `{ valid: boolean, systemId: string, message: string }`

2. **Expected response format**
   ```json
   {
     "valid": true,
     "systemId": "JOB_MANAGER_SYSTEM",
     "message": "Token is valid"
   }
   ```

### What You DON'T Need

- ❌ JM's private key (they won't share it)
- ❌ JM's public key (can't decrypt JWE with public key)
- ❌ Your public key (JM doesn't need it for their tokens)
- ❌ Service token or shared secret

## Alternative: Local Verification (Not Recommended)

**Only works if JM encrypts tokens with YOUR public key** (which would be a special token for your system, not their internal token).

This is NOT the normal case because:
- JM's users get tokens encrypted with JM's keys
- Those tokens are for JM's system, not yours
- If JM encrypted with your public key, it wouldn't work in their system

If you still want to enable local verification:

```yaml
system:
  auth:
    job-manager:
      verify-locally: true  # Only if JM encrypted with YOUR public key
      expected-issuer: JOB_MANAGER_SYSTEM
      expected-system-id: JOB_MANAGER_SYSTEM
```

## Verification Flow

```
JM Request → X-System-Authorization: Bearer <jwe-token>
     ↓
SystemAuthFilter extracts token
     ↓
Calls JM's verify-token API: GET /api/system/verify-token
     Header: Authorization: Bearer <jwe-token>
     ↓
JM verifies token (decrypts with their private key)
     ↓
JM returns: { valid: true, systemId: "JOB_MANAGER_SYSTEM" }
     ↓
If valid → Sets ROLE_SYSTEM authentication
     ↓
Request proceeds to controller
```

## Security Notes

1. **Trust JM's API**: Your system trusts JM's verify-token endpoint response
2. **HTTPS Required**: Always use HTTPS for API calls to JM
3. **Token Expiration**: JM should handle token expiration in their verification
4. **Rate Limiting**: Consider rate limiting on JM's verify-token endpoint
5. **Caching**: Optionally cache verification results (with short TTL)

## Troubleshooting

### API Call Fails
- **Problem**: Cannot reach JM's verify-token endpoint
- **Solution**: Check network connectivity, URL configuration, firewall rules

### Token Verification Fails
- **Problem**: JM returns `valid: false`
- **Solution**: Token may be expired, invalid, or revoked. Check JM's logs.

### Timeout Issues
- **Problem**: API call times out
- **Solution**: Increase timeout, check JM's API performance, add retry logic

## Summary

**For JWE tokens from external systems:**
- ✅ Use **API-based verification** (call their verify-token endpoint)
- ❌ Cannot decrypt JWE tokens encrypted with their keys
- ❌ Don't need their public key or private key
- ✅ Need their verify-token API endpoint URL
