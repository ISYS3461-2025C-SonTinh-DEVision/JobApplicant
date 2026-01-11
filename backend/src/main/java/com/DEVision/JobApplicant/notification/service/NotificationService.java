package com.DEVision.JobApplicant.notification.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.notification.entity.Notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    // Create a new notification
    public Notification createNotification(Notification notification) {
        if (notification.getTimestamp() == null) {
            notification.setTimestamp(LocalDateTime.now());
        }
        return notificationRepository.save(notification);
    }
    
    // Get all notifications for a user (sorted by timestamp DESC - newest first)
    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    // Get unread notifications for a user (sorted by timestamp DESC)
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByTimestampDesc(userId, false);
    }
    
    // Get notification by ID
    public Notification getNotificationById(String id) {
        Optional<Notification> notification = notificationRepository.findById(id);
        return notification.orElse(null);
    }
    
    // Mark notification as read
    public Notification markAsRead(String id) {
        Optional<Notification> optionalNotification = notificationRepository.findById(id);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }
    
    // Mark all notifications as read for a user
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
    
    // Delete notification
    public boolean deleteNotification(String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Get count of unread notifications
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }
    
    // Delete all notifications for a user
    public void deleteAllUserNotifications(String userId) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByTimestampDesc(userId);
        notificationRepository.deleteAll(userNotifications);
    }
}


