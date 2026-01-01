package com.DEVision.JobApplicant.search_profile.service;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;
import com.DEVision.JobApplicant.common.country.model.Country;
import com.DEVision.JobApplicant.search_profile.dto.JobPostEvent;
import com.DEVision.JobApplicant.search_profile.entity.MatchedJobPost;
import com.DEVision.JobApplicant.search_profile.repository.MatchedJobPostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Service to match job posts with applicant profiles
 */
@Service
public class JobMatchingService {

    private static final Logger logger = LoggerFactory.getLogger(JobMatchingService.class);
    private static final double MIN_MATCH_SCORE = 30.0; // Minimum 30% match to save

    @Autowired
    private ApplicantRepository applicantRepository;

    @Autowired
    private MatchedJobPostRepository matchedJobPostRepository;

    /**
     * Match a job post with all applicant profiles
     * Only processes published job posts
     */
    public void matchJobPostWithApplicants(JobPostEvent jobPost) {
        // Only process published job posts
        if (!"published".equalsIgnoreCase(jobPost.getStatus())) {
            logger.debug("Skipping job post {} - status is not published: {}", jobPost.getId(), jobPost.getStatus());
            return;
        }

        // Check if job post has expired
        if (jobPost.getExpiryDate() != null && jobPost.getExpiryDate().isBefore(Instant.now())) {
            logger.debug("Skipping job post {} - expired on {}", jobPost.getId(), jobPost.getExpiryDate());
            return;
        }

        logger.info("Matching job post {} with applicant profiles", jobPost.getId());

        // Get all applicants
        List<Applicant> applicants = applicantRepository.findAll();

        for (Applicant applicant : applicants) {
            try {
                double matchScore = calculateMatchScore(applicant, jobPost);

                if (matchScore >= MIN_MATCH_SCORE) {
                    // Check if already matched
                    if (!matchedJobPostRepository.existsByUserIdAndJobPostId(applicant.getUserId(), jobPost.getId())) {
                        saveMatchedJobPost(applicant, jobPost, matchScore);
                        logger.info("Matched job post {} with applicant {} (score: {}%)",
                                jobPost.getId(), applicant.getUserId(), matchScore);
                    } else {
                        logger.debug("Job post {} already matched for applicant {}", jobPost.getId(),
                                applicant.getUserId());
                    }
                } else {
                    logger.debug("Job post {} does not match applicant {} (score: {}%)",
                            jobPost.getId(), applicant.getUserId(), matchScore);
                }
            } catch (Exception e) {
                logger.error("Error matching job post {} with applicant {}: {}",
                        jobPost.getId(), applicant.getUserId(), e.getMessage(), e);
            }
        }
    }

    /**
     * Calculate match score between applicant and job post (0-100)
     */
    private double calculateMatchScore(Applicant applicant, JobPostEvent jobPost) {
        double totalScore = 0.0;
        double maxScore = 0.0;

        // Skills matching (40% weight)
        double skillsScore = matchSkills(applicant.getSkills(), jobPost.getSkills());
        totalScore += skillsScore * 0.4;
        maxScore += 40.0;

        // Location matching (20% weight)
        double locationScore = matchLocation(applicant.getCountry(), jobPost.getLocation());
        totalScore += locationScore * 0.2;
        maxScore += 20.0;

        // Salary matching (20% weight) - if applicant has salary expectations
        double salaryScore = matchSalary(applicant, jobPost);
        totalScore += salaryScore * 0.2;
        maxScore += 20.0;

        // Employment type matching (20% weight) - if applicant has preferences
        double employmentScore = matchEmploymentType(jobPost.getEmploymentType());
        totalScore += employmentScore * 0.2;
        maxScore += 20.0;

        // Normalize to 0-100
        return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    }

    /**
     * Match skills between applicant and job post
     */
    private double matchSkills(List<String> applicantSkills, List<String> jobSkills) {
        if (jobSkills == null || jobSkills.isEmpty()) {
            return 50.0; // If job doesn't specify skills, give 50% score
        }

        if (applicantSkills == null || applicantSkills.isEmpty()) {
            return 0.0;
        }

        // Normalize skills to lowercase for comparison
        List<String> normalizedApplicantSkills = applicantSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        List<String> normalizedJobSkills = jobSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        // Count matching skills
        long matchedCount = normalizedApplicantSkills.stream()
                .filter(normalizedJobSkills::contains)
                .count();

        // Calculate percentage: (matched skills / required skills) * 100
        return (double) matchedCount / normalizedJobSkills.size() * 100;
    }

    /**
     * Match location between applicant and job post
     */
    private double matchLocation(Country applicantCountry, String jobLocation) {
        if (jobLocation == null || jobLocation.isEmpty()) {
            return 50.0; // If job doesn't specify location, give 50% score
        }

        if (applicantCountry == null) {
            return 0.0;
        }

        String normalizedJobLocation = jobLocation.toLowerCase(Locale.ROOT);
        String countryName = applicantCountry.getDisplayName().toLowerCase(Locale.ROOT);
        String countryCode = applicantCountry.getCode().toLowerCase(Locale.ROOT);

        // Check if job location contains country name or code
        if (normalizedJobLocation.contains(countryName) || normalizedJobLocation.contains(countryCode)) {
            return 100.0;
        }

        // Partial match (e.g., "Ho Chi Minh City, Vietnam" contains "Vietnam")
        return 50.0;
    }

    /**
     * Match salary expectations
     */
    private double matchSalary(Applicant applicant, JobPostEvent jobPost) {
        if (jobPost.getSalary() == null) {
            return 50.0; // If job doesn't specify salary, give 50% score
        }

        // For now, return 50% as we don't have salary expectations in applicant profile
        // This can be enhanced later if salary expectations are added
        return 50.0;
    }

    /**
     * Match employment type
     */
    private double matchEmploymentType(List<String> jobEmploymentTypes) {
        if (jobEmploymentTypes == null || jobEmploymentTypes.isEmpty()) {
            return 50.0; // If job doesn't specify employment type, give 50% score
        }

        // For now, return 50% as we don't have employment type preferences in applicant
        // profile
        // This can be enhanced later if employment type preferences are added
        return 50.0;
    }

    /**
     * Save matched job post
     */
    private void saveMatchedJobPost(Applicant applicant, JobPostEvent jobPost, double matchScore) {
        MatchedJobPost matchedJobPost = new MatchedJobPost();
        matchedJobPost.setUserId(applicant.getUserId());
        matchedJobPost.setApplicantId(applicant.getId());
        matchedJobPost.setJobPostId(jobPost.getId());
        matchedJobPost.setJobTitle(jobPost.getTitle());
        matchedJobPost.setJobDescription(jobPost.getDescription());
        matchedJobPost.setEmploymentTypes(jobPost.getEmploymentType());
        matchedJobPost.setLocation(jobPost.getLocation());
        matchedJobPost.setRequiredSkills(jobPost.getSkills());
        matchedJobPost.setMatchScore(matchScore);
        matchedJobPost.setPostedDate(jobPost.getPostedDate());
        matchedJobPost.setExpiryDate(jobPost.getExpiryDate());

        // Calculate matched skills
        List<String> matchedSkills = findMatchedSkills(applicant.getSkills(), jobPost.getSkills());
        matchedJobPost.setMatchedSkills(matchedSkills);

        // Set salary info
        if (jobPost.getSalary() != null) {
            matchedJobPost.setSalaryMin(jobPost.getSalary().getMin());
            matchedJobPost.setSalaryMax(jobPost.getSalary().getMax());
            matchedJobPost.setSalaryCurrency(jobPost.getSalary().getCurrency());
        }

        matchedJobPostRepository.save(matchedJobPost);
    }

    /**
     * Find skills that match between applicant and job post
     */
    private List<String> findMatchedSkills(List<String> applicantSkills, List<String> jobSkills) {
        if (applicantSkills == null || applicantSkills.isEmpty() ||
                jobSkills == null || jobSkills.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> normalizedApplicantSkills = applicantSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        List<String> normalizedJobSkills = jobSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        return normalizedApplicantSkills.stream()
                .filter(normalizedJobSkills::contains)
                .collect(Collectors.toList());
    }
}
