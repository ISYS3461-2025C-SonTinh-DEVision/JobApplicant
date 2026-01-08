package com.DEVision.JobApplicant.searchProfile.service;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.common.model.PlanType;
import com.DEVision.JobApplicant.notification.entity.Notification;
import com.DEVision.JobApplicant.notification.service.NotificationService;
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
    private NotificationService notificationService;

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
     * Notify premium users about new matched job posts
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
                        // Create notification for premium user
                        Notification notification = new Notification(
                                matchedJobPost.getUserId(),
                                "New Job Match Found!",
                                String.format("A new job post '%s' matches your profile (%.1f%% match). Check it out!",
                                        jobPost.getTitle(), matchedJobPost.getMatchScore())
                        );
                        notification.setType("job_match");

                        notificationService.createNotification(notification);

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

