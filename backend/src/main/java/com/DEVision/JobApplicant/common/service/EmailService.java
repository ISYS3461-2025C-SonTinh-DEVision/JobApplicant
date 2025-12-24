package com.DEVision.JobApplicant.common.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@rentmate.space}")
    private String fromEmail;

    // New: sender display name shown in inbox (e.g., "DEVision Job Applicant")
    @Value("${app.mail.from-name:DEVision}")
    private String fromName;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    /**
     * Send activation email to new user
     * @param toEmail Recipient email address
     * @param activationToken Activation token
     */
    public void sendActivationEmail(String toEmail, String activationToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Activate Your Job Applicant Account");

            String activationLink = frontendBaseUrl + "/activate?token=" + activationToken;

            String emailBody = "Welcome to Job Applicant System!\n\n" +
                    "Thank you for registering. To activate your account, please click the link below:\n\n" +
                    activationLink + "\n\n" +
                    "This activation link will expire in 15 minutes.\n\n" +
                    "If you did not create an account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Job Applicant Team";

            helper.setText(emailBody, false);

            mailSender.send(message);
            System.out.println("Activation email sent to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Failed to send activation email: " + e.getMessage());
            throw new RuntimeException("Failed to send activation email", e);
        }
    }

    /**
     * Send password reset email
     * @param toEmail Recipient email address
     * @param resetToken Password reset token
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Password");

            String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken;

            String emailBody = "Password Reset Request\n\n" +
                    "We received a request to reset your password. Click the link below to reset it:\n\n" +
                    resetLink + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Job Applicant Team";

            helper.setText(emailBody, false);

            mailSender.send(message);
            System.out.println("Password reset email sent to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}
