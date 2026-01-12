package com.DEVision.JobApplicant.notification.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.DEVision.JobApplicant.jwt.JweUtil;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.auth.entity.User;

import java.security.Principal;
import java.util.Collections;
import java.util.List;

/**
 * WebSocket Channel Interceptor for JWE Authentication
 * 
 * This interceptor extracts JWE token from STOMP CONNECT headers,
 * validates it, and sets the Principal for user-targeted messages.
 * Required for convertAndSendToUser() to work properly.
 * 
 * NOTE: This app uses JWE (JSON Web Encryption) NOT JWS (JSON Web Signature)!
 */
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthConfig.class);

    @Autowired
    private JweUtil jweUtil;
    
    @Autowired
    private AuthRepository authRepository;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Extract Authorization header from STOMP CONNECT frame
                    List<String> authHeaders = accessor.getNativeHeader("Authorization");
                    
                    if (authHeaders != null && !authHeaders.isEmpty()) {
                        String authHeader = authHeaders.get(0);
                        
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            String token = authHeader.substring(7);
                            
                            try {
                                // Validate JWE token (decrypt and check expiration)
                                boolean isValid = jweUtil.verifyJweToken(token);
                                logger.info("JWE token validation result: {}", isValid);
                                
                                if (isValid) {
                                    // Extract username (email) from decrypted token
                                    String email = jweUtil.extractUsername(token);
                                    logger.info("Extracted email from JWE: {}", email);
                                    
                                    if (email != null) {
                                        // Find user by email to get userId
                                        User user = authRepository.findByEmail(email);
                                        
                                        if (user != null) {
                                            String userId = user.getId();
                                            String role = user.getRole();
                                            
                                            // Create authentication principal with userId as the name
                                            // This is what convertAndSendToUser() uses to route messages
                                            Principal principal = new UsernamePasswordAuthenticationToken(
                                                userId, // Principal name = userId (important for routing!)
                                                null,
                                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                                            );
                                            
                                            accessor.setUser(principal);
                                            logger.info("WebSocket authenticated user: {} (userId: {})", email, userId);
                                        } else {
                                            logger.warn("User not found for email: {}", email);
                                        }
                                    }
                                } else {
                                    logger.warn("Invalid JWE token for WebSocket connection");
                                }
                            } catch (Exception e) {
                                logger.error("Error validating JWE for WebSocket: {} - {}", e.getClass().getSimpleName(), e.getMessage());
                            }
                        } else {
                            logger.warn("Auth header does not start with 'Bearer '");
                        }
                    } else {
                        logger.debug("No Authorization header in STOMP CONNECT");
                    }
                }
                
                return message;
            }
        });
    }
}


