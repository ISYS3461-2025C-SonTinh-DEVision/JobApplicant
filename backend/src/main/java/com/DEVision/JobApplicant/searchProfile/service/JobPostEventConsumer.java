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

import java.util.List;

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
                        // Create notification request for premium user (saves to DB + sends via WebSocket)
                        NotificationRequest notificationRequest = new NotificationRequest(
                                matchedJobPost.getUserId(),
                                "Job Match Found!",
                                String.format("A new job post '%s' matches your profile (%.1f%% match). Check it out!",
                                        jobPost.getTitle(), matchedJobPost.getMatchScore()),
                                "job_match"
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
}

