package com.DEVision.JobApplicant.applicant.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.DEVision.JobApplicant.applicant.entity.ProfileView;

import java.time.Instant;
import java.util.List;

/**
 * Repository for ProfileView entity
 * Provides methods to query profile view statistics
 */
@Repository
public interface ProfileViewRepository extends MongoRepository<ProfileView, String> {
    
    /**
     * Count total views for an applicant
     */
    long countByApplicantId(String applicantId);
    
    /**
     * Count views for an applicant within a time range
     */
    long countByApplicantIdAndViewedAtBetween(String applicantId, Instant start, Instant end);
    
    /**
     * Count views for an applicant after a certain time
     */
    long countByApplicantIdAndViewedAtAfter(String applicantId, Instant after);
    
    /**
     * Get recent views for an applicant (for activity feed)
     */
    List<ProfileView> findByApplicantIdOrderByViewedAtDesc(String applicantId);
    
    /**
     * Get views for an applicant within a time range
     */
    List<ProfileView> findByApplicantIdAndViewedAtBetweenOrderByViewedAtDesc(
        String applicantId, Instant start, Instant end);
    
    /**
     * Check if a viewer has viewed this profile recently (to avoid duplicate counts)
     */
    boolean existsByApplicantIdAndViewerIdAndViewedAtAfter(
        String applicantId, String viewerId, Instant after);
    
    /**
     * Get unique viewers count for an applicant
     */
    @Query(value = "{ 'applicantId': ?0 }", count = true)
    long countDistinctViewersByApplicantId(String applicantId);
}
