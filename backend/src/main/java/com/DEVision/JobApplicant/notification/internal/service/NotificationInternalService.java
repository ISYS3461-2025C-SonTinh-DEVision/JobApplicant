package com.DEVision.JobApplicant.notification.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.notification.entity.Notification;
import com.DEVision.JobApplicant.notification.external.dto.NotificationResponse;
import com.DEVision.JobApplicant.notification.internal.dto.NotificationListResponse;
import com.DEVision.JobApplicant.notification.service.NotificationService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Internal service for notification module's own business logic
 */
@Service
public class NotificationInternalService {
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Get all notifications for user with metadata
     */
    public NotificationListResponse getUserNotifications(String userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        long unreadCount = notificationService.getUnreadCount(userId);
        
        List<NotificationResponse> responseList = notifications.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return new NotificationListResponse(responseList, notifications.size(), unreadCount);
    }
    
    /**
     * Get only unread notifications
     */
    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationService.getUnreadNotifications(userId).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Mark single notification as read
     */
    public NotificationResponse markAsRead(String notificationId) {
        Notification notification = notificationService.markAsRead(notificationId);
        return notification != null ? toResponse(notification) : null;
    }
    
    /**
     * Mark all user notifications as read
     */
    public void markAllAsRead(String userId) {
        notificationService.markAllAsRead(userId);
    }
    
    /**
     * Delete single notification
     */
    public boolean deleteNotification(String notificationId) {
        return notificationService.deleteNotification(notificationId);
    }
    
    /**
     * Delete all notifications for a user
     */
    public void deleteAllUserNotifications(String userId) {
        notificationService.deleteAllUserNotifications(userId);
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

