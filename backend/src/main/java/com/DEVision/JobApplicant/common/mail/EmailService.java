package com.DEVision.JobApplicant.common.mail;

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

/**
 * Email Service - Handles sending beautiful HTML emails
 * 
 * Features:
 * - HTML email templates with responsive design
 * - Consistent branding with DEVision Job Applicant
 * - Activation and password reset emails
 */
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

        // Brand colors matching frontend
        private static final String PRIMARY_COLOR = "#2563EB";
        private static final String PRIMARY_DARK = "#1D4ED8";
        private static final String ACCENT_COLOR = "#14B8A6";
        private static final String DARK_BG = "#0F172A";
        private static final String SURFACE_COLOR = "#1E293B";
        private static final String TEXT_COLOR = "#F1F5F9";
        private static final String TEXT_MUTED = "#94A3B8";

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private RestTemplate getRestTemplate() {
        if (restTemplate == null) {
            restTemplate = new RestTemplate();
        }
        return restTemplate;
    }

    /**
     * Send activation email to new user using Resend HTTP API with beautiful HTML template
     * @param toEmail Recipient email address
     * @param activationToken Activation token
     */
    public void sendActivationEmail(String toEmail, String activationToken) {
        try {
            if (resendApiKey == null || resendApiKey.isEmpty()) {
                throw new RuntimeException("Resend API key not configured. Set app.mail.resend.api-key in application.yml");
            }

            String activationLink = frontendBaseUrl + "/activate?token=" + activationToken;
            String htmlContent = buildActivationEmailTemplate(toEmail, activationLink);

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromName + " <" + fromEmail + ">");
            requestBody.put("to", toEmail);
            requestBody.put("subject", "🎉 Activate Your DEVision Account");
            requestBody.put("html", htmlContent);

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
     * Send password reset email using Resend HTTP API with beautiful HTML template
     * @param toEmail Recipient email address
     * @param resetToken Password reset token
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            if (resendApiKey == null || resendApiKey.isEmpty()) {
                throw new RuntimeException("Resend API key not configured. Set app.mail.resend.api-key in application.yml");
            }

            String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetEmailTemplate(toEmail, resetLink);

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromName + " <" + fromEmail + ">");
            requestBody.put("to", toEmail);
            requestBody.put("subject", "🔐 Reset Your Password - DEVision");
            requestBody.put("html", htmlContent);

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
    
    /**
     * Build beautiful HTML template for activation email
     */
    private String buildActivationEmailTemplate(String email, String activationLink) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Activate Your Account</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0F172A;">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color: #0F172A; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <!-- Main Container -->
                            <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(180deg, #1E293B 0%%, #0F172A 100%%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                                
                                <!-- Header with Logo -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%%, rgba(20, 184, 166, 0.1) 100%%);">
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #2563EB 0%%, #1D4ED8 100%%); width: 56px; height: 56px; border-radius: 12px; text-align: center; vertical-align: middle; box-shadow: 0 0 30px rgba(37, 99, 235, 0.4);">
                                                    <span style="font-size: 28px;">💼</span>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #F1F5F9;">DEVision</h1>
                                                    <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8; letter-spacing: 1px;">JOB APPLICANT PLATFORM</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Welcome Message -->
                                <tr>
                                    <td style="padding: 30px 40px 20px; text-align: center;">
                                        <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%%, rgba(34, 197, 94, 0.2) 100%%); border-radius: 50%%; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 40px; line-height: 80px;">🎉</span>
                                        </div>
                                        <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #F1F5F9;">Welcome to DEVision!</h2>
                                        <p style="margin: 0; font-size: 16px; color: #94A3B8; line-height: 1.6;">
                                            Thank you for joining our platform. You're just one step away from unlocking amazing career opportunities!
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Activation Button -->
                                <tr>
                                    <td style="padding: 20px 40px 30px; text-align: center;">
                                        <a href="%s" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563EB 0%%, #1D4ED8 100%%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4); transition: all 0.3s;">
                                            ✨ Activate My Account
                                        </a>
                                    </td>
                                </tr>
                                
                                <!-- Info Box -->
                                <tr>
                                    <td style="padding: 0 40px 30px;">
                                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 12px;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="vertical-align: top; padding-right: 12px;">
                                                                <span style="font-size: 20px;">⏰</span>
                                                            </td>
                                                            <td>
                                                                <p style="margin: 0; font-size: 14px; color: #94A3B8;">
                                                                    <strong style="color: #F1F5F9;">Link expires in 24 hours</strong><br>
                                                                    For security reasons, this activation link will expire. Click the button above to activate now!
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Alternative Link -->
                                <tr>
                                    <td style="padding: 0 40px 30px;">
                                        <p style="margin: 0 0 10px; font-size: 13px; color: #64748B; text-align: center;">
                                            If the button doesn't work, copy and paste this link:
                                        </p>
                                        <p style="margin: 0; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; font-size: 12px; color: #2563EB; word-break: break-all; text-align: center;">
                                            %s
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Divider -->
                                <tr>
                                    <td style="padding: 0 40px;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);"></div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px 40px; text-align: center;">
                                        <p style="margin: 0 0 16px; font-size: 13px; color: #64748B;">
                                            Didn't create an account? Just ignore this email.
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #475569;">
                                            © 2025 DEVision Job Applicant. All rights reserved.<br>
                                            <a href="#" style="color: #2563EB; text-decoration: none;">Privacy Policy</a> • 
                                            <a href="#" style="color: #2563EB; text-decoration: none;">Terms of Service</a>
                                        </p>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(activationLink, activationLink);
    }
    
    /**
     * Build beautiful HTML template for password reset email
     */
    private String buildPasswordResetEmailTemplate(String email, String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0F172A;">
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color: #0F172A; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <!-- Main Container -->
                            <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: linear-gradient(180deg, #1E293B 0%%, #0F172A 100%%); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                                
                                <!-- Header with Logo -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%%, rgba(20, 184, 166, 0.1) 100%%);">
                                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="background: linear-gradient(135deg, #2563EB 0%%, #1D4ED8 100%%); width: 56px; height: 56px; border-radius: 12px; text-align: center; vertical-align: middle; box-shadow: 0 0 30px rgba(37, 99, 235, 0.4);">
                                                    <span style="font-size: 28px;">💼</span>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #F1F5F9;">DEVision</h1>
                                                    <p style="margin: 4px 0 0; font-size: 12px; color: #94A3B8; letter-spacing: 1px;">JOB APPLICANT PLATFORM</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Reset Password Message -->
                                <tr>
                                    <td style="padding: 30px 40px 20px; text-align: center;">
                                        <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%%, rgba(245, 158, 11, 0.2) 100%%); border-radius: 50%%; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 40px; line-height: 80px;">🔐</span>
                                        </div>
                                        <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #F1F5F9;">Password Reset Request</h2>
                                        <p style="margin: 0; font-size: 16px; color: #94A3B8; line-height: 1.6;">
                                            We received a request to reset your password. Click the button below to create a new password.
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Reset Button -->
                                <tr>
                                    <td style="padding: 20px 40px 30px; text-align: center;">
                                        <a href="%s" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #F59E0B 0%%, #D97706 100%%); color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 10px 30px rgba(245, 158, 11, 0.4); transition: all 0.3s;">
                                            🔑 Reset My Password
                                        </a>
                                    </td>
                                </tr>
                                
                                <!-- Warning Box -->
                                <tr>
                                    <td style="padding: 0 40px 30px;">
                                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0">
                                                        <tr>
                                                            <td style="vertical-align: top; padding-right: 12px;">
                                                                <span style="font-size: 20px;">⚠️</span>
                                                            </td>
                                                            <td>
                                                                <p style="margin: 0; font-size: 14px; color: #94A3B8;">
                                                                    <strong style="color: #F1F5F9;">Link expires in 1 hour</strong><br>
                                                                    For your security, this password reset link will expire soon. If you didn't request this, please ignore this email.
                                                                </p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Alternative Link -->
                                <tr>
                                    <td style="padding: 0 40px 30px;">
                                        <p style="margin: 0 0 10px; font-size: 13px; color: #64748B; text-align: center;">
                                            If the button doesn't work, copy and paste this link:
                                        </p>
                                        <p style="margin: 0; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; font-size: 12px; color: #F59E0B; word-break: break-all; text-align: center;">
                                            %s
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Divider -->
                                <tr>
                                    <td style="padding: 0 40px;">
                                        <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);"></div>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 30px 40px; text-align: center;">
                                        <p style="margin: 0 0 16px; font-size: 13px; color: #64748B;">
                                            Didn't request a password reset? Just ignore this email.
                                        </p>
                                        <p style="margin: 0; font-size: 12px; color: #475569;">
                                            © 2025 DEVision Job Applicant. All rights reserved.<br>
                                            <a href="#" style="color: #2563EB; text-decoration: none;">Privacy Policy</a> • 
                                            <a href="#" style="color: #2563EB; text-decoration: none;">Terms of Service</a>
                                        </p>
                                    </td>
                                </tr>
                                
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(resetLink, resetLink);
    }

    /**
     * Send email change notification to old email address
     * Requirement 3.1.1: Notify user when email is changed for security
     * @param oldEmail Previous email address
     * @param newEmail New email address
     */
    public void sendEmailChangeNotification(String oldEmail, String newEmail) {
        try {
            if (resendApiKey == null || resendApiKey.isEmpty()) {
                throw new RuntimeException("Resend API key not configured");
            }

            String htmlContent = "<html><body style='font-family:sans-serif;background:#0F172A;padding:40px;'>" +
                "<div style='max-width:600px;margin:0 auto;background:#1E293B;border-radius:16px;padding:40px;'>" +
                "<h1 style='color:#F1F5F9;text-align:center;'>📧 Email Address Changed</h1>" +
                "<p style='color:#94A3B8;text-align:center;'>Your DEVision account email has been changed.</p>" +
                "<div style='background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:20px;margin:20px 0;'>" +
                "<p style='color:#94A3B8;margin:0 0 12px;'><strong style='color:#F1F5F9;'>Previous:</strong> " + oldEmail + "</p>" +
                "<p style='color:#94A3B8;margin:0;'><strong style='color:#F1F5F9;'>New:</strong> " + newEmail + "</p>" +
                "</div>" +
                "<div style='background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:20px;'>" +
                "<p style='color:#94A3B8;margin:0;'>⚠️ <strong style='color:#F1F5F9;'>Didn't make this change?</strong><br>Contact support immediately.</p>" +
                "</div>" +
                "<p style='color:#475569;font-size:12px;text-align:center;margin-top:30px;'>© 2025 DEVision Job Applicant</p>" +
                "</div></body></html>";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromName + " <" + fromEmail + ">");
            requestBody.put("to", oldEmail);
            requestBody.put("subject", "📧 Your Email Address Has Been Changed - DEVision");
            requestBody.put("html", htmlContent);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<?> response = getRestTemplate().postForEntity(RESEND_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Email change notification sent to: " + oldEmail);
            }
        } catch (Exception e) {
            System.err.println("Failed to send email change notification: " + e.getMessage());
        }
    }

    /**
     * Send OTP verification email
     * Used for email change verification flow
     * @param email Target email address
     * @param otp 6-digit OTP code
     */
    public void sendOtpEmail(String email, String otp) {
        try {
            if (resendApiKey == null || resendApiKey.isEmpty()) {
                throw new RuntimeException("Resend API key not configured");
            }

            String htmlContent = "<html><body style='font-family:sans-serif;background:#0F172A;padding:40px;'>" +
                "<div style='max-width:600px;margin:0 auto;background:#1E293B;border-radius:16px;padding:40px;'>" +
                "<h1 style='color:#F1F5F9;text-align:center;margin-bottom:10px;'>🔐 Email Verification</h1>" +
                "<p style='color:#94A3B8;text-align:center;margin-bottom:30px;'>Use this code to verify your email address</p>" +
                "<div style='background:linear-gradient(135deg,rgba(37,99,235,0.2),rgba(20,184,166,0.2));border:2px dashed rgba(37,99,235,0.4);border-radius:16px;padding:30px;text-align:center;margin:20px 0;'>" +
                "<p style='margin:0 0 10px;color:#94A3B8;font-size:14px;'>Your verification code</p>" +
                "<p style='margin:0;color:#F1F5F9;font-size:42px;font-weight:bold;letter-spacing:8px;font-family:monospace;'>" + otp + "</p>" +
                "</div>" +
                "<div style='background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.2);border-radius:12px;padding:16px;margin:20px 0;'>" +
                "<p style='color:#FCD34D;margin:0;font-size:14px;'>⏱️ This code expires in <strong>5 minutes</strong></p>" +
                "</div>" +
                "<p style='color:#64748B;font-size:12px;text-align:center;margin-top:30px;'>" +
                "If you didn't request this code, please ignore this email.<br>" +
                "© 2025 DEVision Job Applicant</p>" +
                "</div></body></html>";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from", fromName + " <" + fromEmail + ">");
            requestBody.put("to", email);
            requestBody.put("subject", "🔐 Your Verification Code - DEVision");
            requestBody.put("html", htmlContent);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<?> response = getRestTemplate().postForEntity(RESEND_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("OTP email sent to: " + email);
            }
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send verification code: " + e.getMessage(), e);
        }
    }
}

