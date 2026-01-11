package com.DEVision.JobApplicant.notification.service;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.notification.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    // Find all notifications for a specific user (sorted by timestamp DESC - newest first)
    List<Notification> findByUserIdOrderByTimestampDesc(String userId);
    
    // Find unread notifications for a user (sorted by timestamp DESC)
    List<Notification> findByUserIdAndIsReadOrderByTimestampDesc(String userId, boolean isRead);
    
    // Find notifications by type for a user (sorted by timestamp DESC)
    List<Notification> findByUserIdAndTypeOrderByTimestampDesc(String userId, String type);
    
    // Count unread notifications for a user
    long countByUserIdAndIsRead(String userId, boolean isRead);
}


