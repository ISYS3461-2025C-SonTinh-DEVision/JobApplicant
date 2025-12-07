package com.DEVision.JobApplicant.notification.external.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.notification.entity.Notification;
import com.DEVision.JobApplicant.notification.external.dto.NotificationRequest;
import com.DEVision.JobApplicant.notification.external.dto.NotificationResponse;
import com.DEVision.JobApplicant.notification.service.NotificationService;
import com.DEVision.JobApplicant.notification.service.WebSocketNotificationService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * External service for other backend modules to send notifications
 * Main purpose: Backend services call this when events occur
 */
@Service
public class NotificationExternalService {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private WebSocketNotificationService webSocketService;
    
    /**
     * PRIMARY METHOD: Send notification to user (saves to DB + sends via WebSocket)
     * Call this from your backend services when events occur
     */
    public NotificationResponse sendNotification(NotificationRequest request) {
        // Save to database
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setTitle(request.getTitle());
        notification.setContent(request.getContent());
        notification.setType(request.getType());
        
        Notification saved = notificationService.createNotification(notification);
        NotificationResponse response = toResponse(saved);
        
        // Send real-time notification via WebSocket
        try {
            webSocketService.sendToUser(request.getUserId(), response);
            // Update unread count
            long unreadCount = notificationService.getUnreadCount(request.getUserId());
            webSocketService.sendUnreadCount(request.getUserId(), unreadCount);
        } catch (Exception e) {
            System.err.println("Failed to send WebSocket notification: " + e.getMessage());
            // Continue - notification is saved in DB even if WebSocket fails
        }
        
        return response;
    }
    
    /**
     * Send notifications to multiple users (batch operation)
     */
    public List<NotificationResponse> sendNotificationToUsers(List<String> userIds, String title, String content, String type) {
        return userIds.stream()
            .map(userId -> {
                NotificationRequest request = new NotificationRequest(userId, title, content, type);
                return sendNotification(request);
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Broadcast system-wide notification (all users)
     */
    public void broadcastNotification(String title, String content, String type) {
        NotificationResponse response = new NotificationResponse();
        response.setTitle(title);
        response.setContent(content);
        response.setType(type);
        
        webSocketService.broadcast(response);
    }
    
    /**
     * Get unread notification count for a user
     */
    public long getUnreadCount(String userId) {
        return notificationService.getUnreadCount(userId);
    }
    
    // Convert entity to response DTO
    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getUserId(),
            notification.getTitle(),
            notification.getContent(),
            notification.getTimestamp(),
            notification.isRead(),
            notification.getType()
        );
    }
}

