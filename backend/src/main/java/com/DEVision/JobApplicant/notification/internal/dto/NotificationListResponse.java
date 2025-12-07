package com.DEVision.JobApplicant.notification.internal.dto;

import com.DEVision.JobApplicant.notification.external.dto.NotificationResponse;

import java.util.List;

// Internal DTO for returning list of notifications with metadata
public class NotificationListResponse {
    
    private List<NotificationResponse> notifications;
    private long totalCount;
    private long unreadCount;
    
    public NotificationListResponse() {}
    
    public NotificationListResponse(List<NotificationResponse> notifications, long totalCount, long unreadCount) {
        this.notifications = notifications;
        this.totalCount = totalCount;
        this.unreadCount = unreadCount;
    }
    
    public List<NotificationResponse> getNotifications() {
        return notifications;
    }
    
    public void setNotifications(List<NotificationResponse> notifications) {
        this.notifications = notifications;
    }
    
    public long getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
    }
    
    public long getUnreadCount() {
        return unreadCount;
    }
    
    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }
}

