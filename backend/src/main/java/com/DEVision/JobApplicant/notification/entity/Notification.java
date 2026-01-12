package com.DEVision.JobApplicant.notification.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.Map;

@Document(collection = "notifications")
public class Notification {
    
    @Id
    private String id;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    // Using Instant (UTC) for consistent timezone handling across all environments
    @NotNull
    private Instant timestamp;
    
    @NotNull
    private boolean isRead;
    
    private String type; // Optional: email, system, alert, JOB_MATCH, etc.
    
    // Metadata for additional data (e.g., job match details)
    private Map<String, Object> metadata;
    
    public Notification() {
        this.timestamp = Instant.now(); // UTC timestamp
        this.isRead = false;
    }
    
    public Notification(String userId, String title, String content) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.timestamp = Instant.now(); // UTC timestamp
        this.isRead = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}



