package com.DEVision.JobApplicant.activity.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.activity.entity.Activity;
import com.DEVision.JobApplicant.activity.entity.Activity.ActivityType;

import java.time.Instant;
import java.util.List;

/**
 * Repository for Activity entity
 * Provides methods to query user activities
 */
@Repository
public interface ActivityRepository extends MongoRepository<Activity, String> {
    
    /**
     * Get recent activities for a user (sorted by createdAt desc)
     */
    List<Activity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    /**
     * Get all activities for a user
     */
    List<Activity> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Get activities by category
     */
    List<Activity> findByUserIdAndCategoryOrderByCreatedAtDesc(String userId, String category, Pageable pageable);
    
    /**
     * Get activities by type
     */
    List<Activity> findByUserIdAndActivityTypeOrderByCreatedAtDesc(String userId, ActivityType activityType);
    
    /**
     * Get activities after a certain time
     */
    List<Activity> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(String userId, Instant after);
    
    /**
     * Count activities for a user
     */
    long countByUserId(String userId);
    
    /**
     * Count activities by category
     */
    long countByUserIdAndCategory(String userId, String category);
}
