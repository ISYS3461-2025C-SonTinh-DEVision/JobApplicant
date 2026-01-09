package com.DEVision.JobApplicant.activity.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

/**
 * Entity to track user activities for the Dashboard's "Recent Activity" section
 * 
 * Activity types include:
 * - Profile updates (avatar, objective, education, work experience, skills)
 * - Account changes (email, password, phone)
 * - Subscription events (upgrade to premium)
 * - Application submissions
 * - Search profile updates
 */
@Document(collection = "activities")
public class Activity {
    
    @Id
    private String id;
    
    /**
     * User ID who performed the activity
     */
    @Indexed
    private String userId;
    
    /**
     * Type of activity (enum-like string)
     */
    @Indexed
    private ActivityType activityType;
    
    /**
     * Short title for display
     */
    private String title;
    
    /**
     * Detailed description
     */
    private String description;
    
    /**
     * Icon name for frontend rendering (e.g., "User", "Lock", "Briefcase")
     */
    private String icon;
    
    /**
     * Category for filtering (applications, profile, security, subscription)
     */
    private String category;
    
    /**
     * Additional metadata (JSON-like structure)
     */
    private Map<String, Object> metadata;
    
    /**
     * Timestamp when activity occurred
     */
    @Indexed
    private Instant createdAt;
    
    /**
     * Whether this activity should also create a notification
     */
    private boolean shouldNotify;
    
    // Enum for activity types
    public enum ActivityType {
        // Profile activities
        PROFILE_UPDATE("Profile Updated", "profile"),
        AVATAR_UPLOAD("Avatar Uploaded", "profile"),
        OBJECTIVE_UPDATE("Objective Updated", "profile"),
        EDUCATION_ADD("Education Added", "profile"),
        EDUCATION_UPDATE("Education Updated", "profile"),
        EDUCATION_DELETE("Education Removed", "profile"),
        WORK_ADD("Work Experience Added", "profile"),
        WORK_UPDATE("Work Experience Updated", "profile"),
        WORK_DELETE("Work Experience Removed", "profile"),
        SKILL_ADD("Skills Added", "profile"),
        SKILL_REMOVE("Skill Removed", "profile"),
        PORTFOLIO_ADD("Portfolio Item Added", "profile"),
        PORTFOLIO_DELETE("Portfolio Item Removed", "profile"),
        
        // Account/Security activities
        EMAIL_CHANGE("Email Changed", "security"),
        PASSWORD_CHANGE("Password Changed", "security"),
        PHONE_CHANGE("Phone Number Updated", "security"),
        ACCOUNT_ACTIVATED("Account Activated", "security"),
        LOGIN_SUCCESS("Login Successful", "security"),
        
        // Subscription activities
        SUBSCRIPTION_UPGRADE("Upgraded to Premium", "subscription"),
        SUBSCRIPTION_CANCEL("Subscription Cancelled", "subscription"),
        PAYMENT_SUCCESS("Payment Successful", "subscription"),
        
        // Application activities
        APPLICATION_SUBMIT("Application Submitted", "applications"),
        APPLICATION_WITHDRAW("Application Withdrawn", "applications"),
        
        // Search Profile activities
        SEARCH_PROFILE_CREATE("Search Profile Created", "profile"),
        SEARCH_PROFILE_UPDATE("Search Profile Updated", "profile"),
        
        // Job Match activities
        JOB_MATCH_FOUND("New Job Match Found", "applications");
        
        private final String displayTitle;
        private final String category;
        
        ActivityType(String displayTitle, String category) {
            this.displayTitle = displayTitle;
            this.category = category;
        }
        
        public String getDisplayTitle() {
            return displayTitle;
        }
        
        public String getCategory() {
            return category;
        }
    }
    
    // Constructors
    public Activity() {
        this.createdAt = Instant.now();
        this.shouldNotify = false;
    }
    
    public Activity(String userId, ActivityType activityType, String description) {
        this.userId = userId;
        this.activityType = activityType;
        this.title = activityType.getDisplayTitle();
        this.category = activityType.getCategory();
        this.description = description;
        this.createdAt = Instant.now();
        this.shouldNotify = false;
        this.icon = getIconForType(activityType);
    }
    
    /**
     * Get appropriate icon name for activity type
     */
    private String getIconForType(ActivityType type) {
        switch (type.getCategory()) {
            case "profile":
                if (type == ActivityType.AVATAR_UPLOAD) return "Camera";
                if (type == ActivityType.EDUCATION_ADD || type == ActivityType.EDUCATION_UPDATE) return "GraduationCap";
                if (type == ActivityType.WORK_ADD || type == ActivityType.WORK_UPDATE) return "Briefcase";
                if (type == ActivityType.SKILL_ADD) return "Code";
                if (type == ActivityType.PORTFOLIO_ADD) return "Image";
                if (type == ActivityType.SEARCH_PROFILE_CREATE || type == ActivityType.SEARCH_PROFILE_UPDATE) return "Target";
                return "User";
            case "security":
                if (type == ActivityType.EMAIL_CHANGE) return "Mail";
                if (type == ActivityType.PASSWORD_CHANGE) return "Lock";
                if (type == ActivityType.PHONE_CHANGE) return "Phone";
                if (type == ActivityType.LOGIN_SUCCESS) return "LogIn";
                return "Shield";
            case "subscription":
                if (type == ActivityType.SUBSCRIPTION_UPGRADE) return "Crown";
                if (type == ActivityType.PAYMENT_SUCCESS) return "CreditCard";
                return "Sparkles";
            case "applications":
                if (type == ActivityType.JOB_MATCH_FOUND) return "Target";
                return "FileText";
            default:
                return "Activity";
        }
    }
    
    // Builder pattern for fluent API
    public Activity withMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
        return this;
    }
    
    public Activity withNotification(boolean shouldNotify) {
        this.shouldNotify = shouldNotify;
        return this;
    }
    
    public Activity withIcon(String icon) {
        this.icon = icon;
        return this;
    }
    
    // Getters and Setters
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

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isShouldNotify() {
        return shouldNotify;
    }

    public void setShouldNotify(boolean shouldNotify) {
        this.shouldNotify = shouldNotify;
    }
}
