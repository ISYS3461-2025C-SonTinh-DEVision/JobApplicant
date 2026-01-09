package com.DEVision.JobApplicant.activity.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.activity.entity.Activity;
import com.DEVision.JobApplicant.activity.entity.Activity.ActivityType;
import com.DEVision.JobApplicant.activity.internal.dto.ActivityResponse;
import com.DEVision.JobApplicant.activity.repository.ActivityRepository;
import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.notification.internal.dto.NotificationRequest;
import com.DEVision.JobApplicant.notification.internal.service.NotificationInternalService;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for recording and retrieving user activities
 * Integrates with NotificationService to create notifications for important activities
 */
@Service
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private AuthRepository authRepository;
    
    @Autowired
    private NotificationInternalService notificationService;
    
    // Activity types that should also create notifications
    private static final ActivityType[] NOTIFY_ACTIVITIES = {
        ActivityType.EMAIL_CHANGE,
        ActivityType.PASSWORD_CHANGE,
        ActivityType.SUBSCRIPTION_UPGRADE,
        ActivityType.APPLICATION_SUBMIT,
        ActivityType.JOB_MATCH_FOUND,
        ActivityType.ACCOUNT_ACTIVATED
    };
    
    /**
     * Record an activity for the current authenticated user
     */
    public Activity recordActivity(ActivityType type, String description) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return null;
        }
        return recordActivity(userId, type, description, null, shouldNotify(type));
    }
    
    /**
     * Record an activity with metadata
     */
    public Activity recordActivity(ActivityType type, String description, Map<String, Object> metadata) {
        String userId = getCurrentUserId();
        if (userId == null) {
            return null;
        }
        return recordActivity(userId, type, description, metadata, shouldNotify(type));
    }
    
    /**
     * Record an activity for a specific user
     */
    public Activity recordActivityForUser(String userId, ActivityType type, String description) {
        return recordActivity(userId, type, description, null, shouldNotify(type));
    }
    
    /**
     * Record an activity for a specific user with metadata
     */
    public Activity recordActivityForUser(String userId, ActivityType type, String description, Map<String, Object> metadata) {
        return recordActivity(userId, type, description, metadata, shouldNotify(type));
    }
    
    /**
     * Core method to record an activity
     */
    private Activity recordActivity(String userId, ActivityType type, String description, 
                                    Map<String, Object> metadata, boolean createNotification) {
        try {
            Activity activity = new Activity(userId, type, description);
            if (metadata != null) {
                activity.setMetadata(metadata);
            }
            activity.setShouldNotify(createNotification);
            
            Activity saved = activityRepository.save(activity);
            
            // Create notification if needed
            if (createNotification) {
                createNotificationForActivity(userId, activity);
            }
            
            return saved;
        } catch (Exception e) {
            System.err.println("Failed to record activity: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Create a notification for an activity
     */
    private void createNotificationForActivity(String userId, Activity activity) {
        try {
            NotificationRequest request = new NotificationRequest();
            request.setTitle(activity.getTitle());
            request.setContent(activity.getDescription());
            request.setType(mapActivityTypeToNotificationType(activity.getActivityType()));
            
            notificationService.createNotificationForUser(userId, request);
        } catch (Exception e) {
            System.err.println("Failed to create notification for activity: " + e.getMessage());
        }
    }
    
    /**
     * Map activity type to notification type
     */
    private String mapActivityTypeToNotificationType(ActivityType type) {
        switch (type) {
            case APPLICATION_SUBMIT:
                return "APPLICATION";
            case JOB_MATCH_FOUND:
                return "JOB_MATCH";
            case SUBSCRIPTION_UPGRADE:
            case PAYMENT_SUCCESS:
                return "SUBSCRIPTION";
            case EMAIL_CHANGE:
            case PASSWORD_CHANGE:
            case ACCOUNT_ACTIVATED:
                return "SECURITY";
            default:
                return "SYSTEM";
        }
    }
    
    /**
     * Check if activity type should trigger a notification
     */
    private boolean shouldNotify(ActivityType type) {
        for (ActivityType notifyType : NOTIFY_ACTIVITIES) {
            if (notifyType == type) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get recent activities for the current user
     */
    public List<ActivityResponse> getMyRecentActivities(int limit) {
        String userId = getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        
        List<Activity> activities = activityRepository.findByUserIdOrderByCreatedAtDesc(
            userId, PageRequest.of(0, limit));
        
        return activities.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Get activities by category for the current user
     */
    public List<ActivityResponse> getMyActivitiesByCategory(String category, int limit) {
        String userId = getCurrentUserId();
        if (userId == null) {
            throw new SecurityException("User not authenticated");
        }
        
        List<Activity> activities = activityRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(
            userId, category, PageRequest.of(0, limit));
        
        return activities.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Convert Activity entity to ActivityResponse DTO
     */
    private ActivityResponse toResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setActivityType(activity.getActivityType().name());
        response.setTitle(activity.getTitle());
        response.setDescription(activity.getDescription());
        response.setIcon(activity.getIcon());
        response.setCategory(activity.getCategory());
        response.setMetadata(activity.getMetadata());
        response.setCreatedAt(activity.getCreatedAt());
        response.setTimeAgo(formatTimeAgo(activity.getCreatedAt()));
        return response;
    }
    
    /**
     * Format time ago string
     */
    private String formatTimeAgo(Instant timestamp) {
        if (timestamp == null) return "Just now";
        
        Duration duration = Duration.between(timestamp, Instant.now());
        
        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + (minutes == 1 ? " minute ago" : " minutes ago");
        if (hours < 24) return hours + (hours == 1 ? " hour ago" : " hours ago");
        if (days < 7) return days + (days == 1 ? " day ago" : " days ago");
        if (days < 30) return (days / 7) + (days / 7 == 1 ? " week ago" : " weeks ago");
        return (days / 30) + (days / 30 == 1 ? " month ago" : " months ago");
    }
    
    /**
     * Get current authenticated user's ID
     */
    private String getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return null;
            }
            
            String email = auth.getName();
            User user = authRepository.findByEmail(email);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    // ===== Convenience methods for specific activity types =====
    
    public void recordProfileUpdate(String field) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("field", field);
        recordActivity(ActivityType.PROFILE_UPDATE, "Updated " + field, metadata);
    }
    
    public void recordEducationAdd(String degree, String institution) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("degree", degree);
        metadata.put("institution", institution);
        recordActivity(ActivityType.EDUCATION_ADD, degree + " at " + institution, metadata);
    }
    
    public void recordWorkExperienceAdd(String jobTitle, String company) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("jobTitle", jobTitle);
        metadata.put("company", company);
        recordActivity(ActivityType.WORK_ADD, jobTitle + " at " + company, metadata);
    }
    
    public void recordSkillsAdd(List<String> skills) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("skills", skills);
        String skillsStr = String.join(", ", skills);
        recordActivity(ActivityType.SKILL_ADD, "Added skills: " + skillsStr, metadata);
    }
    
    public void recordApplicationSubmit(String jobTitle, String company) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("jobTitle", jobTitle);
        metadata.put("company", company);
        recordActivity(ActivityType.APPLICATION_SUBMIT, "Applied for " + jobTitle + " at " + company, metadata);
    }
    
    public void recordSubscriptionUpgrade(String userId) {
        recordActivityForUser(userId, ActivityType.SUBSCRIPTION_UPGRADE, "Upgraded to Premium subscription");
    }
    
    public void recordPasswordChange() {
        recordActivity(ActivityType.PASSWORD_CHANGE, "Password was changed");
    }
    
    public void recordEmailChange(String newEmail) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("newEmail", newEmail);
        recordActivity(ActivityType.EMAIL_CHANGE, "Email changed to " + newEmail, metadata);
    }
    
    public void recordSearchProfileUpdate() {
        recordActivity(ActivityType.SEARCH_PROFILE_UPDATE, "Search profile updated");
    }
    
    public void recordAvatarUpload() {
        recordActivity(ActivityType.AVATAR_UPLOAD, "Profile picture updated");
    }
}
