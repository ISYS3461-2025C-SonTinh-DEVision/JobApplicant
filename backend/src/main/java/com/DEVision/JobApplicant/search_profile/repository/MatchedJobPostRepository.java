package com.DEVision.JobApplicant.search_profile.repository;

import com.DEVision.JobApplicant.search_profile.entity.MatchedJobPost;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface MatchedJobPostRepository extends MongoRepository<MatchedJobPost, String> {

    /**
     * Find all matched job posts for a user
     */
    List<MatchedJobPost> findByUserId(String userId);

    /**
     * Find all matched job posts for an applicant
     */
    List<MatchedJobPost> findByApplicantId(String applicantId);

    /**
     * Find matched job post by user ID and job post ID
     */
    Optional<MatchedJobPost> findByUserIdAndJobPostId(String userId, String jobPostId);

    /**
     * Find unviewed matched job posts for a user
     */
    List<MatchedJobPost> findByUserIdAndIsViewed(String userId, Boolean isViewed);

    /**
     * Check if a job post is already matched for a user
     */
    boolean existsByUserIdAndJobPostId(String userId, String jobPostId);

    /**
     * Find all matched job posts for a specific job post ID
     */
    List<MatchedJobPost> findByJobPostId(String jobPostId);
}
