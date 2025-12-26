package com.DEVision.JobApplicant.applicant.entity;

import org.bson.types.ObjectId;

import java.time.LocalDateTime;

/**
 * Entity representing a portfolio item (image or video)
 * Used to showcase applicant's skills and activities
 */
public class PortfolioItem {
    
    private ObjectId id;
    private String url;           // Cloudinary secure URL
    private String publicId;      // Cloudinary public ID for deletion
    private String resourceType;  // "image" or "video"
    private String title;         // Optional title/description
    private LocalDateTime uploadedAt;

    public PortfolioItem() {
        this.id = new ObjectId();
        this.uploadedAt = LocalDateTime.now();
    }

    public PortfolioItem(String url, String publicId, String resourceType) {
        this.id = new ObjectId();
        this.url = url;
        this.publicId = publicId;
        this.resourceType = resourceType;
        this.uploadedAt = LocalDateTime.now();
    }

    public PortfolioItem(String url, String publicId, String resourceType, String title) {
        this.id = new ObjectId();
        this.url = url;
        this.publicId = publicId;
        this.resourceType = resourceType;
        this.title = title;
        this.uploadedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
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

