package com.DEVision.JobApplicant.notification.service;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.notification.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    // Find all notifications for a specific user
    List<Notification> findByUserId(String userId);
    
    // Find unread notifications for a user
    List<Notification> findByUserIdAndIsRead(String userId, boolean isRead);
    
    // Find notifications by type for a user
    List<Notification> findByUserIdAndType(String userId, String type);
    
    // Count unread notifications for a user
    long countByUserIdAndIsRead(String userId, boolean isRead);
}

