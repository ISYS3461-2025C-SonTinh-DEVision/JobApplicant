package com.DEVision.JobApplicant.notification.internal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.notification.entity.Notification;
import com.DEVision.JobApplicant.notification.external.dto.NotificationResponse;
import com.DEVision.JobApplicant.notification.internal.dto.NotificationListResponse;
import com.DEVision.JobApplicant.notification.internal.dto.NotificationRequest;
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
    
    @Autowired
    private AuthRepository authRepository;
    
    /**
     * Create notification for a specific user (used by other modules like ActivityService)
     */
    public NotificationResponse createNotificationForUser(String userId, NotificationRequest request) {
        Notification notification = new Notification(userId, request.getTitle(), request.getContent());
        notification.setType(request.getType());
        Notification saved = notificationService.createNotification(notification);
        return toResponse(saved);
    }
    
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
    
    /**
     * Get notifications for current authenticated user with metadata
     * @param unreadOnly if true, returns only unread notifications; if false, returns all notifications
     */
    public NotificationListResponse getMyNotifications(boolean unreadOnly) {
        String userId = getCurrentUserId();
        
        if (unreadOnly) {
            // Return only unread notifications with metadata
            List<NotificationResponse> unreadNotifications = getUnreadNotifications(userId);
            long unreadCount = notificationService.getUnreadCount(userId);
            return new NotificationListResponse(unreadNotifications, unreadNotifications.size(), unreadCount);
        } else {
            // Return all notifications with metadata
            return getUserNotifications(userId);
        }
    }
    
    /**
     * Mark all notifications as read for current authenticated user
     */
    public void markMyAllAsRead() {
        String userId = getCurrentUserId();
        markAllAsRead(userId);
    }
    
    /**
     * Delete all notifications for current authenticated user
     */
    public void deleteMyAllNotifications() {
        String userId = getCurrentUserId();
        deleteAllUserNotifications(userId);
    }
    
    /**
     * Mark notification as read (with ownership validation)
     */
    public NotificationResponse markMyNotificationAsRead(String notificationId) {
        String userId = getCurrentUserId();
        Notification notification = notificationService.getNotificationById(notificationId);
        
        if (notification == null) {
            return null;
        }
        
        // Validate ownership
        if (!notification.getUserId().equals(userId)) {
            throw new SecurityException("You can only mark your own notifications as read");
        }
        
        return markAsRead(notificationId);
    }
    
    /**
     * Delete notification (with ownership validation)
     */
    public boolean deleteMyNotification(String notificationId) {
        String userId = getCurrentUserId();
        Notification notification = notificationService.getNotificationById(notificationId);
        
        if (notification == null) {
            return false;
        }
        
        // Validate ownership
        if (!notification.getUserId().equals(userId)) {
            throw new SecurityException("You can only delete your own notifications");
        }
        
        return deleteNotification(notificationId);
    }
    
    // Helper methods
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }
        
        String email = authentication.getName();
        User user = authRepository.findByEmail(email);
        
        if (user == null) {
            throw new SecurityException("User not found. Please log in again.");
        }
        
        return user.getId();
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
            notification.getType(),
            notification.getMetadata()
        );
    }
}


