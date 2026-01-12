package com.DEVision.JobApplicant.searchProfile.service;

import com.DEVision.JobApplicant.notification.external.dto.NotificationRequest;
import com.DEVision.JobApplicant.notification.external.service.NotificationExternalService;
import com.DEVision.JobApplicant.searchProfile.dto.JobPostEvent;
import com.DEVision.JobApplicant.searchProfile.entity.MatchedJobPost;
import com.DEVision.JobApplicant.searchProfile.repository.MatchedJobPostRepository;
import com.DEVision.JobApplicant.subscription.entity.Subscription;
import com.DEVision.JobApplicant.subscription.enums.PlanType;
import com.DEVision.JobApplicant.subscription.enums.SubscriptionStatus;
import com.DEVision.JobApplicant.subscription.repository.SubscriptionRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Kafka consumer for job post events
 * Consumes job post events and matches them with applicant profiles
 * Sends real-time WebSocket notifications to premium users
 */
@Component
public class JobPostEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(JobPostEventConsumer.class);
    private static final String TOPIC = "job-post-events";

    @Autowired
    private JobMatchingService jobMatchingService;

    @Autowired
    private MatchedJobPostRepository matchedJobPostRepository;

    @Autowired
    private NotificationExternalService notificationExternalService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    /**
     * Consume job post events from Kafka
     * Handles wrapped events from JM with eventType, eventId, timestamp, and data fields
     */
    @KafkaListener(topics = TOPIC, groupId = "${spring.kafka.consumer.group-id:job-applicant-search-profile-group-local}")
    public void consumeJobPostEvent(JobPostEvent jobPost) {
        try {
            logger.info("===== Received Kafka event from topic: {} =====", TOPIC);
            logger.info("Event details: {}", jobPost);
            
            // Check event type - only process JOB_POST_CREATED events
            String eventType = jobPost.getEventType();
            if (eventType != null && !"JOB_POST_CREATED".equalsIgnoreCase(eventType) 
                    && !"JOB_POST_UPDATED".equalsIgnoreCase(eventType)) {
                logger.debug("Skipping event type: {} (only processing JOB_POST_CREATED/JOB_POST_UPDATED)", eventType);
                return;
            }
            
            // Validate required fields using smart getters
            if (jobPost.getId() == null || jobPost.getTitle() == null) {
                logger.warn("Received job post event with null id or title. Event: {}", jobPost);
                return;
            }
            
            logger.info("Processing job post: id={}, title={}, status={}, skills={}", 
                    jobPost.getId(), jobPost.getTitle(), jobPost.getStatus(), jobPost.getSkills());

            // Match job post with search profiles (user's job search preferences)
            jobMatchingService.matchJobPostWithSearchProfiles(jobPost);

            // Send notifications to premium users who got matches
            notifyPremiumUsers(jobPost);

        } catch (Exception e) {
            logger.error("Error processing job post event: {}", e.getMessage(), e);
        }
    }

    /**
     * Notify premium users about new matched job posts via WebSocket
     */
    private void notifyPremiumUsers(JobPostEvent jobPost) {
        try {
            // Find all newly matched job posts for this job post
            List<MatchedJobPost> matchedJobPosts = matchedJobPostRepository
                    .findByJobPostId(jobPost.getId());

            for (MatchedJobPost matchedJobPost : matchedJobPosts) {
                // Only notify if not already notified
                if (matchedJobPost.getIsNotified() == null || !matchedJobPost.getIsNotified()) {
                    // Get subscription to check plan type
                    Optional<Subscription> subscriptionOpt = subscriptionRepository
                            .findByUserId(matchedJobPost.getUserId());

                    if (subscriptionOpt.isPresent()) {
                        Subscription subscription = subscriptionOpt.get();
                        
                        // Check if subscription is PREMIUM and ACTIVE
                        if (subscription.getPlanType() == PlanType.PREMIUM 
                                && subscription.getStatus() == SubscriptionStatus.ACTIVE) {
                            // Build match data metadata for View Details modal
                            Map<String, Object> matchData = buildMatchData(matchedJobPost, jobPost);
                            
                            // Create notification request for premium user (saves to DB + sends via WebSocket)
                            NotificationRequest notificationRequest = new NotificationRequest(
                                    matchedJobPost.getUserId(),
                                    String.format("New Job Match! %.0f%% Match", matchedJobPost.getMatchScore()),
                                    String.format("Job: %s in %s. Matched skills: %s",
                                            jobPost.getTitle(),
                                            matchedJobPost.getLocation() != null ? matchedJobPost.getLocation() : "Unknown",
                                            matchedJobPost.getMatchedSkills() != null ? 
                                                String.join(", ", matchedJobPost.getMatchedSkills()) : "N/A"),
                                    "JOB_MATCH",
                                    matchData
                            );

                            // Use external service for DB save + WebSocket push
                            notificationExternalService.sendNotification(notificationRequest);

                            // Mark as notified
                            matchedJobPost.setIsNotified(true);
                            matchedJobPostRepository.save(matchedJobPost);

                            logger.info("Sent notification to premium user {} for job post {}", 
                                    matchedJobPost.getUserId(), jobPost.getId());
                        } else {
                            logger.debug("Skipping notification for user {} - subscription is not premium or not active", 
                                    matchedJobPost.getUserId());
                        }
                    } else {
                        logger.debug("Skipping notification for user {} - no subscription found", 
                                matchedJobPost.getUserId());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error sending notifications for job post {}: {}", 
                    jobPost.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Build metadata for job match notification (for View Details modal)
     */
    private Map<String, Object> buildMatchData(MatchedJobPost matchedJobPost, JobPostEvent jobPost) {
        Map<String, Object> matchData = new HashMap<>();
        
        // Job info
        matchData.put("jobPostId", matchedJobPost.getJobPostId());
        matchData.put("jobTitle", matchedJobPost.getJobTitle());
        matchData.put("jobDescription", matchedJobPost.getJobDescription());
        matchData.put("location", matchedJobPost.getLocation());
        matchData.put("employmentTypes", matchedJobPost.getEmploymentTypes());
        
        // Salary info
        matchData.put("salaryMin", matchedJobPost.getSalaryMin());
        matchData.put("salaryMax", matchedJobPost.getSalaryMax());
        matchData.put("salaryCurrency", matchedJobPost.getSalaryCurrency() != null ? 
                matchedJobPost.getSalaryCurrency() : "USD");
        
        // Skills match info
        matchData.put("requiredSkills", matchedJobPost.getRequiredSkills());
        matchData.put("matchedSkills", matchedJobPost.getMatchedSkills());
        
        // Overall match score
        matchData.put("matchScore", matchedJobPost.getMatchScore());
        
        // ========== SCORE BREAKDOWN (actual algorithm values) ==========
        // These are the real calculated scores from JobMatchingService
        matchData.put("skillsScore", matchedJobPost.getSkillsScore() != null ? matchedJobPost.getSkillsScore() : 0);
        matchData.put("salaryScore", matchedJobPost.getSalaryScore() != null ? matchedJobPost.getSalaryScore() : 0);
        matchData.put("locationScore", matchedJobPost.getLocationScore() != null ? matchedJobPost.getLocationScore() : 0);
        matchData.put("employmentScore", matchedJobPost.getEmploymentScore() != null ? matchedJobPost.getEmploymentScore() : 0);
        matchData.put("titleScore", matchedJobPost.getTitleScore() != null ? matchedJobPost.getTitleScore() : 0);
        
        // Dates
        matchData.put("postedDate", matchedJobPost.getPostedDate());
        matchData.put("expiryDate", matchedJobPost.getExpiryDate());
        
        return matchData;
    }
}



