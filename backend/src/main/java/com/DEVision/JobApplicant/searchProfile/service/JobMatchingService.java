package com.DEVision.JobApplicant.searchProfile.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.searchProfile.EmploymentType;
import com.DEVision.JobApplicant.searchProfile.dto.JobPostEvent;
import com.DEVision.JobApplicant.searchProfile.entity.MatchedJobPost;
import com.DEVision.JobApplicant.searchProfile.entity.SearchProfile;
import com.DEVision.JobApplicant.searchProfile.repository.MatchedJobPostRepository;
import com.DEVision.JobApplicant.searchProfile.repository.SearchProfileRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Service to match job posts with search profiles (user's job search preferences)
 */
@Service
public class JobMatchingService {

    private static final Logger logger = LoggerFactory.getLogger(JobMatchingService.class);
    private static final double MIN_MATCH_SCORE = 30.0; // Minimum 30% match to save

    @Autowired
    private SearchProfileRepository searchProfileRepository;

    @Autowired
    private MatchedJobPostRepository matchedJobPostRepository;

    /**
     * Match a job post with all search profiles (user's job search preferences)
     * Only processes published job posts
     */
    public void matchJobPostWithSearchProfiles(JobPostEvent jobPost) {
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

        logger.info("Matching job post {} with search profiles", jobPost.getId());

        // Get all search profiles
        List<SearchProfile> searchProfiles = searchProfileRepository.findAll();

        for (SearchProfile searchProfile : searchProfiles) {
            try {
                MatchScoreResult matchResult = calculateMatchScore(searchProfile, jobPost);

                if (matchResult.totalScore >= MIN_MATCH_SCORE) {
                    // Check if already matched
                    if (!matchedJobPostRepository.existsByUserIdAndJobPostId(searchProfile.getUserId(), jobPost.getId())) {
                        saveMatchedJobPost(searchProfile, jobPost, matchResult);
                        logger.info("Matched job post {} with search profile {} (userId: {}, score: {}%)",
                                jobPost.getId(), searchProfile.getId(), searchProfile.getUserId(), matchResult.totalScore);
                    } else {
                        logger.debug("Job post {} already matched for user {}", jobPost.getId(),
                                searchProfile.getUserId());
                    }
                } else {
                    logger.debug("Job post {} does not match search profile {} (score: {}%)",
                            jobPost.getId(), searchProfile.getId(), matchResult.totalScore);
                }
            } catch (Exception e) {
                logger.error("Error matching job post {} with search profile {}: {}",
                        jobPost.getId(), searchProfile.getId(), e.getMessage(), e);
            }
        }
    }

    /**
     * Result class to hold match score with detailed breakdown
     */
    private static class MatchScoreResult {
        double totalScore;
        double skillsScore;
        double salaryScore;
        double locationScore;
        double employmentScore;
        double titleScore;
        
        MatchScoreResult(double totalScore, double skillsScore, double salaryScore, 
                         double locationScore, double employmentScore, double titleScore) {
            this.totalScore = totalScore;
            this.skillsScore = skillsScore;
            this.salaryScore = salaryScore;
            this.locationScore = locationScore;
            this.employmentScore = employmentScore;
            this.titleScore = titleScore;
        }
    }

    /**
     * Calculate match score between search profile and job post (0-100)
     * Returns detailed breakdown of individual component scores
     */
    private MatchScoreResult calculateMatchScore(SearchProfile searchProfile, JobPostEvent jobPost) {
        double totalScore = 0.0;
        double maxScore = 0.0;

        // Skills matching (30% weight)
        double skillsScore = matchSkills(searchProfile.getDesiredSkills(), jobPost.getSkills());
        totalScore += skillsScore * 0.3;
        maxScore += 30.0;

        // Location matching (20% weight)
        double locationScore = matchLocation(searchProfile.getDesiredCountry(), jobPost.getLocation());
        totalScore += locationScore * 0.2;
        maxScore += 20.0;

        // Salary matching (25% weight)
        double salaryScore = matchSalary(searchProfile, jobPost);
        totalScore += salaryScore * 0.25;
        maxScore += 25.0;

        // Employment type matching (15% weight)
        double employmentScore = matchEmploymentType(searchProfile.getEmploymentTypes(), jobPost.getEmploymentType());
        totalScore += employmentScore * 0.15;
        maxScore += 15.0;

        // Job title matching (10% weight)
        double titleScore = matchJobTitle(searchProfile.getJobTitles(), jobPost.getTitle());
        totalScore += titleScore * 0.1;
        maxScore += 10.0;

        // Normalize to 0-100
        double finalScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        
        return new MatchScoreResult(finalScore, skillsScore, salaryScore, locationScore, employmentScore, titleScore);
    }

    /**
     * Match skills between search profile desired skills and job post required skills
     */
    private double matchSkills(List<String> desiredSkills, List<String> jobSkills) {
        if (jobSkills == null || jobSkills.isEmpty()) {
            return 50.0; // If job doesn't specify skills, give 50% score
        }

        if (desiredSkills == null || desiredSkills.isEmpty()) {
            return 0.0;
        }

        // Normalize skills to lowercase for comparison
        List<String> normalizedDesiredSkills = desiredSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        List<String> normalizedJobSkills = jobSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        // Count matching skills (skills that user wants AND job requires)
        long matchedCount = normalizedDesiredSkills.stream()
                .filter(normalizedJobSkills::contains)
                .count();

        // Calculate percentage: (matched skills / job required skills) * 100
        return (double) matchedCount / normalizedJobSkills.size() * 100;
    }

    /**
     * Match location between search profile desired country and job post location
     */
    private double matchLocation(String desiredCountry, String jobLocation) {
        if (jobLocation == null || jobLocation.isEmpty()) {
            return 50.0; // If job doesn't specify location, give 50% score
        }

        if (desiredCountry == null || desiredCountry.isEmpty()) {
            return 0.0;
        }

        String normalizedJobLocation = jobLocation.toLowerCase(Locale.ROOT);
        String normalizedDesiredCountry = desiredCountry.toLowerCase(Locale.ROOT).trim();

        // Check if job location contains desired country
        if (normalizedJobLocation.contains(normalizedDesiredCountry)) {
            return 100.0;
        }

        // Partial match
        return 50.0;
    }

    /**
     * Match salary between search profile salary range and job post salary
     */
    private double matchSalary(SearchProfile searchProfile, JobPostEvent jobPost) {
        if (jobPost.getSalary() == null) {
            return 50.0; // If job doesn't specify salary, give 50% score
        }

        if (searchProfile.getMinSalary() == null && searchProfile.getMaxSalary() == null) {
            return 50.0; // If user doesn't specify salary expectations, give 50% score
        }

        BigDecimal jobMin = jobPost.getSalary().getMin();
        BigDecimal jobMax = jobPost.getSalary().getMax();
        BigDecimal userMin = searchProfile.getMinSalary();
        BigDecimal userMax = searchProfile.getMaxSalary();

        // If job has both min and max
        if (jobMin != null && jobMax != null) {
            if (userMin != null && userMax != null) {
                // Both have ranges - check if they overlap
                // Overlap: jobMax >= userMin AND jobMin <= userMax
                if (jobMax.compareTo(userMin) >= 0 && jobMin.compareTo(userMax) <= 0) {
                    return 100.0;
                }
                // Check if job salary is completely within user's range
                if (jobMin.compareTo(userMin) >= 0 && jobMax.compareTo(userMax) <= 0) {
                    return 100.0;
                }
                // Check if close (within 20% of user's range)
                BigDecimal userRange = userMax.subtract(userMin);
                BigDecimal tolerance = userRange.multiply(new BigDecimal("0.2"));
                if (jobMin.subtract(userMax).abs().compareTo(tolerance) <= 0 ||
                    userMin.subtract(jobMax).abs().compareTo(tolerance) <= 0) {
                    return 75.0;
                }
            } else if (userMin != null) {
                // User only has minimum - check if job max meets or exceeds minimum
                if (jobMax.compareTo(userMin) >= 0) {
                    return 100.0;
                }
                // Check if close (within 20% of user min)
                BigDecimal diff = userMin.subtract(jobMax);
                if (diff.compareTo(userMin.multiply(new BigDecimal("0.2"))) <= 0) {
                    return 75.0;
                }
            } else if (userMax != null) {
                // User only has maximum - check if job min is within maximum
                if (jobMin.compareTo(userMax) <= 0) {
                    return 100.0;
                }
                // Check if close (within 20% of user max)
                BigDecimal diff = jobMin.subtract(userMax);
                if (diff.compareTo(userMax.multiply(new BigDecimal("0.2"))) <= 0) {
                    return 75.0;
                }
            }
        } else if (jobMin != null) {
            // Job only has minimum
            if (userMax != null && jobMin.compareTo(userMax) <= 0) {
                return 100.0;
            }
            if (userMin != null && jobMin.compareTo(userMin) >= 0) {
                return 100.0;
            }
        } else if (jobMax != null) {
            // Job only has maximum
            if (userMin != null && jobMax.compareTo(userMin) >= 0) {
                return 100.0;
            }
            if (userMax != null && jobMax.compareTo(userMax) <= 0) {
                return 100.0;
            }
        }

        return 30.0; // Partial match or no match
    }

    /**
     * Match employment type between search profile preferences and job post
     */
    private double matchEmploymentType(List<EmploymentType> desiredEmploymentTypes, List<String> jobEmploymentTypes) {
        if (jobEmploymentTypes == null || jobEmploymentTypes.isEmpty()) {
            return 50.0; // If job doesn't specify employment type, give 50% score
        }

        if (desiredEmploymentTypes == null || desiredEmploymentTypes.isEmpty()) {
            return 0.0;
        }

        // Convert EmploymentType enum to lowercase strings for comparison
        List<String> normalizedDesiredTypes = desiredEmploymentTypes.stream()
                .map(et -> et.name().toLowerCase(Locale.ROOT))
                .collect(Collectors.toList());

        List<String> normalizedJobTypes = jobEmploymentTypes.stream()
                .map(et -> et.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        // Check if any desired employment type matches job employment types
        boolean hasMatch = normalizedDesiredTypes.stream()
                .anyMatch(normalizedJobTypes::contains);

        return hasMatch ? 100.0 : 0.0;
    }

    /**
     * Match job title between search profile preferences and job post title
     */
    private double matchJobTitle(List<String> desiredJobTitles, String jobTitle) {
        if (jobTitle == null || jobTitle.isEmpty()) {
            return 50.0; // If job doesn't specify title, give 50% score
        }

        if (desiredJobTitles == null || desiredJobTitles.isEmpty()) {
            return 0.0;
        }

        String normalizedJobTitle = jobTitle.toLowerCase(Locale.ROOT).trim();

        // Check if job title contains any of the desired job titles
        boolean hasMatch = desiredJobTitles.stream()
                .map(desired -> desired.toLowerCase(Locale.ROOT).trim())
                .anyMatch(normalizedJobTitle::contains);

        return hasMatch ? 100.0 : 0.0;
    }

    /**
     * Save matched job post with detailed score breakdown
     */
    private void saveMatchedJobPost(SearchProfile searchProfile, JobPostEvent jobPost, MatchScoreResult matchResult) {
        MatchedJobPost matchedJobPost = new MatchedJobPost();
        matchedJobPost.setUserId(searchProfile.getUserId());
        matchedJobPost.setApplicantId(null); // Not using applicant ID anymore
        matchedJobPost.setJobPostId(jobPost.getId());
        matchedJobPost.setJobTitle(jobPost.getTitle());
        matchedJobPost.setJobDescription(jobPost.getDescription());
        matchedJobPost.setEmploymentTypes(jobPost.getEmploymentType());
        matchedJobPost.setLocation(jobPost.getLocation());
        matchedJobPost.setRequiredSkills(jobPost.getSkills());
        matchedJobPost.setMatchScore(matchResult.totalScore);
        matchedJobPost.setPostedDate(jobPost.getPostedDate());
        matchedJobPost.setExpiryDate(jobPost.getExpiryDate());
        
        // Save individual component scores for detailed breakdown
        matchedJobPost.setSkillsScore(matchResult.skillsScore);
        matchedJobPost.setSalaryScore(matchResult.salaryScore);
        matchedJobPost.setLocationScore(matchResult.locationScore);
        matchedJobPost.setEmploymentScore(matchResult.employmentScore);
        matchedJobPost.setTitleScore(matchResult.titleScore);

        // Calculate matched skills (skills that user wants AND job requires)
        List<String> matchedSkills = findMatchedSkills(searchProfile.getDesiredSkills(), jobPost.getSkills());
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
     * Find skills that match between search profile desired skills and job post required skills
     */
    private List<String> findMatchedSkills(List<String> desiredSkills, List<String> jobSkills) {
        if (desiredSkills == null || desiredSkills.isEmpty() ||
                jobSkills == null || jobSkills.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> normalizedDesiredSkills = desiredSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        List<String> normalizedJobSkills = jobSkills.stream()
                .map(s -> s.toLowerCase(Locale.ROOT).trim())
                .collect(Collectors.toList());

        return normalizedDesiredSkills.stream()
                .filter(normalizedJobSkills::contains)
                .collect(Collectors.toList());
    }
}
