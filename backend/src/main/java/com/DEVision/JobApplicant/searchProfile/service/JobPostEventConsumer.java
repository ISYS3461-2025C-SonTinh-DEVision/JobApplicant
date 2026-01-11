package com.DEVision.JobApplicant.searchProfile.service;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.common.model.PlanType;
import com.DEVision.JobApplicant.notification.external.dto.NotificationRequest;
import com.DEVision.JobApplicant.notification.external.service.NotificationExternalService;
import com.DEVision.JobApplicant.searchProfile.dto.JobPostEvent;
import com.DEVision.JobApplicant.searchProfile.entity.MatchedJobPost;
import com.DEVision.JobApplicant.searchProfile.repository.MatchedJobPostRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Kafka consumer for job post events
 * Consumes job post events and matches them with applicant profiles
 * Sends real-time WebSocket notifications to premium users
 */
@Component
public class JobPostEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(JobPostEventConsumer.class);
    private static final String TOPIC = "job-post-events"; // Adjust topic name as needed
    private static final String GROUP_ID = "job-applicant-search-profile-group";

    @Autowired
    private JobMatchingService jobMatchingService;

    @Autowired
    private MatchedJobPostRepository matchedJobPostRepository;

    @Autowired
    private NotificationExternalService notificationExternalService;

    @Autowired
    private AuthRepository authRepository;

    /**
     * Consume job post events from Kafka
     */
    @KafkaListener(topics = TOPIC, groupId = GROUP_ID)
    public void consumeJobPostEvent(JobPostEvent jobPost) {
        try {
            logger.info("Received job post event: {} - {}", jobPost.getId(), jobPost.getTitle());

            // Match job post with search profiles (user's job search preferences)
            jobMatchingService.matchJobPostWithSearchProfiles(jobPost);

            // Send notifications to premium users who got matches
            notifyPremiumUsers(jobPost);

        } catch (Exception e) {
            logger.error("Error processing job post event {}: {}", jobPost.getId(), e.getMessage(), e);
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
                    // Get user to check plan type
                    User user = authRepository.findById(matchedJobPost.getUserId()).orElse(null);

                    if (user != null && user.getPlanType() == PlanType.PREMIUM) {
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
                        logger.debug("Skipping notification for user {} - not premium or user not found", 
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
        
        // Match score
        matchData.put("matchScore", matchedJobPost.getMatchScore());
        
        // Dates
        matchData.put("postedDate", matchedJobPost.getPostedDate());
        matchData.put("expiryDate", matchedJobPost.getExpiryDate());
        
        // Company info - not available in JobPostEvent, leave for frontend to fetch if needed
        
        return matchData;
    }
}


