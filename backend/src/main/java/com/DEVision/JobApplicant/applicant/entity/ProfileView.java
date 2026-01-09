package com.DEVision.JobApplicant.applicant.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Entity to track profile view events
 * Records when a company/JM views an applicant's profile
 * 
 * API Provision Requirement: Track when "Applicant Profile Data" endpoint is called
 */
@Document(collection = "profile_views")
public class ProfileView {
    
    @Id
    private String id;
    
    /**
     * The applicant whose profile was viewed
     */
    @Indexed
    private String applicantId;
    
    /**
     * Who viewed the profile (company ID if available, otherwise IP or "anonymous")
     */
    private String viewerId;
    
    /**
     * Type of viewer: COMPANY, JOB_MANAGER, ANONYMOUS
     */
    private ViewerType viewerType;
    
    /**
     * Timestamp when the view occurred
     */
    @Indexed
    private Instant viewedAt;
    
    /**
     * User agent or request source for analytics
     */
    private String userAgent;
    
    /**
     * IP address (hashed for privacy)
     */
    private String ipHash;
    
    // Enum for viewer types
    public enum ViewerType {
        COMPANY,
        JOB_MANAGER,
        ANONYMOUS
    }
    
    // Constructors
    public ProfileView() {
        this.viewedAt = Instant.now();
    }
    
    public ProfileView(String applicantId, String viewerId, ViewerType viewerType) {
        this.applicantId = applicantId;
        this.viewerId = viewerId;
        this.viewerType = viewerType;
        this.viewedAt = Instant.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(String applicantId) {
        this.applicantId = applicantId;
    }

    public String getViewerId() {
        return viewerId;
    }

    public void setViewerId(String viewerId) {
        this.viewerId = viewerId;
    }

    public ViewerType getViewerType() {
        return viewerType;
    }

    public void setViewerType(ViewerType viewerType) {
        this.viewerType = viewerType;
    }

    public Instant getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(Instant viewedAt) {
        this.viewedAt = viewedAt;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getIpHash() {
        return ipHash;
    }

    public void setIpHash(String ipHash) {
        this.ipHash = ipHash;
    }
}
