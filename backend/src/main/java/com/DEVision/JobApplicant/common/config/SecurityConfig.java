package com.DEVision.JobApplicant.common.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import com.DEVision.JobApplicant.filter.AuthRequestFilter;
import com.DEVision.JobApplicant.auth.config.AuthConfig;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Autowired
	private AuthRequestFilter authRequestFilter;

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public BCryptPasswordEncoder defaultEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable())
		 	.cors(cors -> {})
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests((requests) -> requests
				// Public auth endpoints
				.requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/logout", "/api/auth/activate", "/api/auth/resend-activation", "/api/auth/forgot-password", "/api/auth/reset-password", "/api/countries").permitAll()
				// Swagger/OpenAPI documentation endpoints
				.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
				// Notification endpoints (for testing - consider requiring auth in production)
				.requestMatchers("/api/notifications/**").permitAll()
				// WebSocket endpoint
				.requestMatchers("/ws/**").permitAll()
				// Protected endpoints
				.requestMatchers("/api/auth/check-session").authenticated()
				.anyRequest().authenticated()
			)
			.logout(logout -> logout
				.logoutUrl("/api/auth/logout") 
				.logoutSuccessHandler((request, response, authentication) -> {
					// Delete auth cookie
					Cookie authCookie = new Cookie(AuthConfig.AUTH_COOKIE_NAME, "");
					authCookie.setMaxAge(0);
					authCookie.setPath("/");
					authCookie.setHttpOnly(true);
					authCookie.setSecure(false);
					
					// Delete refresh cookie
					Cookie refreshCookie = new Cookie(AuthConfig.REFRESH_COOKIE_NAME, "");
					refreshCookie.setMaxAge(0);
					refreshCookie.setPath("/");
					refreshCookie.setHttpOnly(true);
					refreshCookie.setSecure(false);
			
					response.addCookie(authCookie);
					response.addCookie(refreshCookie);
			
					response.setStatus(HttpServletResponse.SC_OK);
					response.getWriter().write("{\"success\": true}");
				})
			);

		http.addFilterBefore(authRequestFilter, 
				UsernamePasswordAuthenticationFilter.class);

		return http.build();
    }
}