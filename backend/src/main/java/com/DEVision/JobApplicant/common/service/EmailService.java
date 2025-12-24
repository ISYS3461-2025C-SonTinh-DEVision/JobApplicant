package com.DEVision.JobApplicant.common.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Autowired(required = false)
    private RestTemplate restTemplate;

    @Value("${app.mail.from:noreply@rentmate.space}")
    private String fromEmail;

    @Value("${app.mail.from-name:DEVision}")
    private String fromName;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${app.mail.resend.api-key:}")
    private String resendApiKey;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private RestTemplate getRestTemplate() {
        if (restTemplate == null) {
            restTemplate = new RestTemplate();
        }
        return restTemplate;
    }

    /**
     * Send activation email to new user using Resend HTTP API
     * @param toEmail Recipient email address
     * @param activationToken Activation token
     */
    public void sendActivationEmail(String toEmail, String activationToken) {
        try {
            if (resendApiKey == null || resendApiKey.isEmpty()) {
                throw new RuntimeException("Resend API key not configured. Set app.mail.resend.api-key in application.yml");
            }

            String activationLink = frontendBaseUrl + "/activate?token=" + activationToken;

            String emailBody = "Welcome to Job Applicant System!\n\n" +
                    "Thank you for registering. To activate your account, please click the link below:\n\n" +
                    activationLink + "\n\n" +
                    "This activation link will expire in 15 minutes.\n\n" +
                    "If you did not create an account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Job Applicant Team";

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromName + " <" + fromEmail + ">");
            requestBody.put("to", toEmail);
            requestBody.put("subject", "Activate Your Job Applicant Account");
            requestBody.put("text", emailBody);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (resendApiKey != null) {
                headers.setBearerAuth(resendApiKey);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send HTTP POST request to Resend API
            ResponseEntity<?> response = getRestTemplate().postForEntity(
                    RESEND_API_URL,
                    request,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Activation email sent to: " + toEmail);
            } else {
                throw new RuntimeException("Failed to send email. Resend API returned: " + response.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("Failed to send activation email: " + e.getMessage());
            throw new RuntimeException("Failed to send activation email: " + e.getMessage(), e);
        }
    }

    /**
     * Send password reset email using Resend HTTP API
     * @param toEmail Recipient email address
     * @param resetToken Password reset token
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            if (resendApiKey == null || resendApiKey.isEmpty()) {
                throw new RuntimeException("Resend API key not configured. Set app.mail.resend.api-key in application.yml");
            }

            String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken;

            String emailBody = "Password Reset Request\n\n" +
                    "We received a request to reset your password. Click the link below to reset it:\n\n" +
                    resetLink + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Job Applicant Team";

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromName + " <" + fromEmail + ">");
            requestBody.put("to", toEmail);
            requestBody.put("subject", "Reset Your Password");
            requestBody.put("text", emailBody);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (resendApiKey != null) {
                headers.setBearerAuth(resendApiKey);
            }

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send HTTP POST request to Resend API
            ResponseEntity<?> response = getRestTemplate().postForEntity(
                    RESEND_API_URL,
                    request,
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Password reset email sent to: " + toEmail);
            } else {
                throw new RuntimeException("Failed to send email. Resend API returned: " + response.getStatusCode());
            }

        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage(), e);
        }
    }
}
