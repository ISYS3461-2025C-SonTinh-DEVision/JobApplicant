package com.DEVision.JobApplicant.filter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.DEVision.JobApplicant.auth.config.AuthConfig;
import com.DEVision.JobApplicant.jwt.JwtUtil;

@Component
public class AuthRequestFilter extends OncePerRequestFilter { 
	
	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private com.DEVision.JobApplicant.common.service.RedisService redisService;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		String token = null;
		boolean isValidToken = false;

		String requestPath = request.getServletPath();
		
		// DEBUG: Log the request path being checked
		System.out.println("AuthRequestFilter checking path: " + requestPath);

		// Public paths that don't require authentication
		if (requestPath.equals("/api/auth/login") ||
		    requestPath.equals("/api/auth/register") ||
		    requestPath.equals("/api/auth/refresh") ||
		    requestPath.equals("/api/auth/logout") ||
		    requestPath.equals("/api/auth/activate") ||
		    requestPath.equals("/api/auth/forgot-password") ||
		    requestPath.equals("/api/auth/reset-password") ||
		    requestPath.equals("/api/countries") ||
		    requestPath.equals("/api/system/verify-token") ||
		    requestPath.startsWith("/swagger-ui") ||
		    requestPath.startsWith("/v3/api-docs") ||
		    requestPath.startsWith("/api/notifications") ||
		    requestPath.startsWith("/api/admin") ||
		    requestPath.startsWith("/ws/")) {
			System.out.println("AuthRequestFilter: Path " + requestPath + " is PUBLIC, skipping auth");
			filterChain.doFilter(request, response);
			return;
		}

		// Try to extract token from Authorization header first (Bearer token)
		String authHeader = request.getHeader("Authorization");
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			token = authHeader.substring(7);
			isValidToken = jwtUtil.verifyJwtSignature(token);
		}

		// If no Bearer token, try to get token from cookie
		if (token == null) {
			Cookie[] cookies = request.getCookies();
			if (cookies != null) {
				for (Cookie ck : cookies) {
					if (AuthConfig.AUTH_COOKIE_NAME.equals(ck.getName())) {
						token = ck.getValue();
						isValidToken = jwtUtil.verifyJwtSignature(token);
						break;
					}
				}
			}
		}

		// Check if token is blacklisted (revoked during logout)
		if (token != null) {
			try {
				if (redisService.isTokenBlacklisted(token)) {
					// Token has been revoked - reject authentication
					filterChain.doFilter(request, response);
					return;
				}
			} catch (Exception redisException) {
				// Redis unavailable - log warning and proceed without blacklist check
				System.out.println("Warning: Redis unavailable, skipping token blacklist check: " + redisException.getMessage());
			}
		}

		// Skip if system authentication is already set (from SystemAuthFilter)
		if (SecurityContextHolder.getContext().getAuthentication() != null) {
			filterChain.doFilter(request, response);
			return;
		}

		if (token != null && isValidToken
			&& SecurityContextHolder.getContext().getAuthentication() == null) {

			String username = jwtUtil.extractUsername(token);

			UserDetails userDetails = userDetailsService.loadUserByUsername(username);

			UsernamePasswordAuthenticationToken usernamePasswordAuthToken =
					new UsernamePasswordAuthenticationToken(
							userDetails,
							null,
							userDetails.getAuthorities()
					);

			usernamePasswordAuthToken.setDetails(new WebAuthenticationDetailsSource()
					.buildDetails(request));

			SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthToken);

			System.out.println(String.format("Authenticate Token Set:\n"
							+ "Username: %s\n"
							+ "Authority: %s\n",
					userDetails.getUsername(),
					userDetails.getAuthorities().toString()));
		}

		filterChain.doFilter(request, response);
	}
}
