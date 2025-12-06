package com.DEVision.JobApplicant.notification.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.notification.external.dto.NotificationResponse;

/**
 * Service for sending real-time notifications via WebSocket
 */
@Service
public class WebSocketNotificationService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send notification to specific user via WebSocket
     * Destination: /user/{userId}/queue/notifications
     */
    public void sendToUser(String userId, NotificationResponse notification) {
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/queue/notifications", 
            notification
        );
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
}

