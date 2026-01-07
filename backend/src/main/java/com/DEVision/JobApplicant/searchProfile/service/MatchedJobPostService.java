package com.DEVision.JobApplicant.searchProfile.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.searchProfile.entity.MatchedJobPost;
import com.DEVision.JobApplicant.searchProfile.repository.MatchedJobPostRepository;

import java.util.List;
import java.util.Optional;

/**
 * Service for managing matched job posts
 */
@Service
public class MatchedJobPostService {

    @Autowired
    private MatchedJobPostRepository matchedJobPostRepository;

    /**
     * Get all matched job posts for a user
     */
    public List<MatchedJobPost> getMatchedJobPostsByUserId(String userId) {
        return matchedJobPostRepository.findByUserId(userId);
    }

    /**
     * Get all matched job posts for an applicant
     */
    public List<MatchedJobPost> getMatchedJobPostsByApplicantId(String applicantId) {
        return matchedJobPostRepository.findByApplicantId(applicantId);
    }

    /**
     * Get unviewed matched job posts for a user
     */
    public List<MatchedJobPost> getUnviewedMatchedJobPosts(String userId) {
        return matchedJobPostRepository.findByUserIdAndIsViewed(userId, false);
    }

    /**
     * Mark a matched job post as viewed
     */
    public MatchedJobPost markAsViewed(String matchedJobPostId) {
        Optional<MatchedJobPost> optional = matchedJobPostRepository.findById(matchedJobPostId);
        if (optional.isPresent()) {
            MatchedJobPost matchedJobPost = optional.get();
            matchedJobPost.setIsViewed(true);
            return matchedJobPostRepository.save(matchedJobPost);
        }
        return null;
    }

    /**
     * Get matched job post by ID
     */
    public Optional<MatchedJobPost> getMatchedJobPostById(String id) {
        return matchedJobPostRepository.findById(id);
    }

    /**
     * Check if job post is already matched for user
     */
    public boolean isJobPostMatched(String userId, String jobPostId) {
        return matchedJobPostRepository.existsByUserIdAndJobPostId(userId, jobPostId);
    }
}

