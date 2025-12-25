package com.DEVision.JobApplicant.applicant.internal.dto;

import java.time.LocalDateTime;

/**
 * Response DTO for portfolio item
 */
public class PortfolioItemResponse {
    
    private String id;
    private String url;
    private String resourceType;  // "image" or "video"
    private String title;
    private LocalDateTime uploadedAt;

    public PortfolioItemResponse() {}

    public PortfolioItemResponse(String id, String url, String resourceType, String title, LocalDateTime uploadedAt) {
        this.id = id;
        this.url = url;
        this.resourceType = resourceType;
        this.title = title;
        this.uploadedAt = uploadedAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}

