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
		Cookie[] cookies = request.getCookies();

		String requestPath = request.getServletPath();

		// Public paths that don't require authentication
		if (requestPath.equals("/login") ||
		    requestPath.equals("/register") ||
		    requestPath.equals("/refresh") ||
		    requestPath.equals("/logout") ||
		    requestPath.equals("/activate") ||
		    requestPath.equals("/forgot-password") ||
		    requestPath.equals("/reset-password") ||
		    requestPath.equals("/api/countries") ||
		    requestPath.startsWith("/swagger-ui") ||
		    requestPath.startsWith("/v3/api-docs") ||
		    requestPath.startsWith("/api/")) {
			filterChain.doFilter(request, response);
			return;
		}

		if (cookies != null) {
			for (Cookie ck : cookies) {
				if (AuthConfig.AUTH_COOKIE_NAME.equals(ck.getName())) {
					token = ck.getValue();
					isValidToken = jwtUtil.verifyJwtSignature(token);
					break;
				}
			}

			// Check if token is blacklisted (revoked during logout)
			if (token != null && redisService.isTokenBlacklisted(token)) {
				// Token has been revoked - reject authentication
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
		}
		filterChain.doFilter(request, response);
	}
}
