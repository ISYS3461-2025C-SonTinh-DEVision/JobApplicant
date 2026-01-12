package com.DEVision.JobApplicant.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.notification.external.dto.NotificationResponse;

/**
 * Service for sending real-time notifications via WebSocket
 */
@Service
public class WebSocketNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send notification to specific user via WebSocket
     * Destination: /user/{userId}/queue/notifications
     */
    public void sendToUser(String userId, NotificationResponse notification) {
        logger.info("Sending WebSocket notification to user: {} - Type: {} - Title: {}", 
            userId, notification.getType(), notification.getTitle());
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/notifications", 
            notification
        );
        logger.info("WebSocket notification sent successfully to user: {}", userId);
    }
    
    /**
     * Broadcast notification to all connected users
     * Destination: /topic/notifications
     */
    public void broadcast(NotificationResponse notification) {
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }
    
    /**
     * Send unread count update to specific user
     * Destination: /user/{userId}/queue/notification-count
     */
    public void sendUnreadCount(String userId, long count) {
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/notification-count", 
            new UnreadCountMessage(count)
        );
    }
    
    // Inner class for count message
    public static class UnreadCountMessage {
        private long unreadCount;
        
        public UnreadCountMessage(long unreadCount) {
            this.unreadCount = unreadCount;
        }
        
        public long getUnreadCount() {
            return unreadCount;
        }
        
        public void setUnreadCount(long unreadCount) {
            this.unreadCount = unreadCount;
        }
    }
    
    // ==========================================
    // Admin Action Notifications (Real-time)
    // ==========================================
    
    /**
     * Send account deactivated alert to specific user
     * Forces immediate logout on client side
     * Destination: /user/{userId}/queue/admin-action
     */
    public void sendAccountDeactivatedAlert(String userId, String reason) {
        AdminActionMessage message = new AdminActionMessage(
            "ACCOUNT_DEACTIVATED",
            "Your account has been deactivated by an administrator.",
            reason
        );
        messagingTemplate.convertAndSendToUser(
            userId,
            "/queue/admin-action",
            message
        );
        logger.info("Sent account deactivation alert to user: {}", userId);
    }
    
    /**
     * Send job post deleted alert to users who might be viewing it
     * Broadcasts to all users (client filters by jobPostId)
     * Destination: /topic/admin-action
     */
    public void sendJobPostDeletedAlert(String jobPostId, String jobTitle) {
        AdminActionMessage message = new AdminActionMessage(
            "JOB_POST_DELETED",
            "The job post \"" + jobTitle + "\" has been removed by an administrator.",
            null
        );
        message.setResourceId(jobPostId);
        messagingTemplate.convertAndSend("/topic/admin-action", message);
        logger.info("Broadcast job post deletion alert for: {}", jobPostId);
    }
    
    /**
     * Send company deactivated alert
     * Broadcasts to all users (client filters by companyId)
     * Destination: /topic/admin-action
     */
    public void sendCompanyDeactivatedAlert(String companyId, String companyName) {
        AdminActionMessage message = new AdminActionMessage(
            "COMPANY_DEACTIVATED",
            "The company \"" + companyName + "\" has been deactivated by an administrator.",
            null
        );
        message.setResourceId(companyId);
        messagingTemplate.convertAndSend("/topic/admin-action", message);
        logger.info("Broadcast company deactivation alert for: {}", companyId);
    }
    
    /**
     * Inner class for admin action messages
     */
    public static class AdminActionMessage {
        private String type;
        private String message;
        private String reason;
        private String resourceId;
        private long timestamp;
        
        public AdminActionMessage(String type, String message, String reason) {
            this.type = type;
            this.message = message;
            this.reason = reason;
            this.timestamp = System.currentTimeMillis();
        }
        
        // Getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
}

