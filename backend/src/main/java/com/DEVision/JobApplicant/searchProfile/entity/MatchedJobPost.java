package com.DEVision.JobApplicant.searchProfile.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Entity to store matched job posts for applicants
 * These are job posts that match the applicant's profile and can be viewed
 * later
 */
@Setter
@Getter
@Document(collection = "matched_job_posts")
public class MatchedJobPost {

    @Id
    private String id;

    private String userId;

    private String applicantId;

    private String jobPostId;

    private String jobTitle;

    private String jobDescription;

    private List<String> employmentTypes;

    private BigDecimal salaryMin;

    private BigDecimal salaryMax;

    private String salaryCurrency;

    private String location;

    private List<String> requiredSkills;

    private List<String> matchedSkills; // Skills that the applicant has

    private Double matchScore; // Percentage match (0-100)
    
    // ========== SCORE BREAKDOWN FOR DETAILED VIEW ==========
    // Individual component scores (0-100) based on actual matching algorithm
    private Double skillsScore;      // Skills matching score (30% weight in final)
    private Double salaryScore;      // Salary matching score (25% weight in final)
    private Double locationScore;    // Location matching score (20% weight in final)
    private Double employmentScore;  // Employment type matching score (15% weight in final)
    private Double titleScore;       // Job title matching score (10% weight in final)

    private Instant postedDate;

    private Instant expiryDate;

    private Boolean isViewed;

    private Boolean isNotified; // Whether notification was sent

    @CreatedDate
    private Instant createdAt;

    public MatchedJobPost() {
        this.isViewed = false;
        this.isNotified = false;
    }
}

