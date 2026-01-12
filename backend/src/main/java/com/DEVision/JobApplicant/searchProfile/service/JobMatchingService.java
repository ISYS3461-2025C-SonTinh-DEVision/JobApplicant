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
import com.DEVision.JobApplicant.jobManager.jobpost.service.CallJobPostService;
import com.DEVision.JobApplicant.jobManager.jobpost.external.dto.JobPostDto;
import com.DEVision.JobApplicant.notification.external.dto.NotificationRequest;
import com.DEVision.JobApplicant.notification.external.service.NotificationExternalService;
import com.DEVision.JobApplicant.subscription.entity.Subscription;
import com.DEVision.JobApplicant.subscription.enums.PlanType;
import com.DEVision.JobApplicant.subscription.enums.SubscriptionStatus;
import com.DEVision.JobApplicant.subscription.repository.SubscriptionRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
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
    
    @Autowired
    private CallJobPostService callJobPostService;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private NotificationExternalService notificationExternalService;

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
     * @return the saved MatchedJobPost entity
     */
    private MatchedJobPost saveMatchedJobPost(SearchProfile searchProfile, JobPostEvent jobPost, MatchScoreResult matchResult) {
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

        return matchedJobPostRepository.save(matchedJobPost);
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
    
    /**
     * On-demand job matching for a specific user
     * Only matches jobs posted AFTER the search profile was created
     * (Requirement 5.3.1: match incoming NEW job posts against subscriber criteria)
     * 
     * @param userId The user ID to check matches for
     * @return List of newly matched job posts (only new ones from this check)
     */
    public List<MatchedJobPost> checkMatchesForUser(String userId) {
        logger.info("===== On-demand job matching for user {} =====", userId);
        
        List<MatchedJobPost> newMatches = new ArrayList<>();
        
        // Get user's search profile
        List<SearchProfile> profiles = searchProfileRepository.findByUserId(userId);
        if (profiles == null || profiles.isEmpty()) {
            logger.warn("No search profile found for user {}", userId);
            return newMatches;
        }
        
        SearchProfile searchProfile = profiles.get(0);
        Instant profileCreatedAt = searchProfile.getCreatedAt();
        
        logger.info("Found search profile for user {}: skills={}, country={}, createdAt={}", 
                userId, searchProfile.getDesiredSkills(), searchProfile.getDesiredCountry(), profileCreatedAt);
        
        // Fetch all job posts from JM API
        List<JobPostDto> jobPosts;
        try {
            jobPosts = callJobPostService.getAllJobPosts();
            logger.info("Fetched {} job posts from JM API", jobPosts.size());
        } catch (Exception e) {
            logger.error("Failed to fetch job posts from JM API: {}", e.getMessage(), e);
            return newMatches;
        }
        
        // Match each job post against the user's search profile
        for (JobPostDto jobPost : jobPosts) {
            try {
                // Skip inactive jobs
                if (!Boolean.TRUE.equals(jobPost.getIsActive())) {
                    continue;
                }
                
                // Check if already matched
                if (matchedJobPostRepository.existsByUserIdAndJobPostId(userId, jobPost.getUniqueId())) {
                    logger.debug("Job {} already matched for user {}", jobPost.getUniqueId(), userId);
                    continue;
                }
                
                // Only match jobs posted AFTER the search profile was created
                // This ensures only "new" jobs are matched (Requirement 5.3.1)
                Instant jobPostedDate = parseDate(jobPost.getPostedDate());
                if (profileCreatedAt != null && jobPostedDate != null && jobPostedDate.isBefore(profileCreatedAt)) {
                    logger.debug("Skipping job {} - posted {} before profile created {}", 
                            jobPost.getUniqueId(), jobPostedDate, profileCreatedAt);
                    continue;
                }
                
                // Convert JobPostDto to JobPostEvent for matching
                JobPostEvent event = convertToJobPostEvent(jobPost);
                
                // Calculate match score
                MatchScoreResult matchResult = calculateMatchScore(searchProfile, event);
                
                if (matchResult.totalScore >= MIN_MATCH_SCORE) {
                    MatchedJobPost match = saveMatchedJobPost(searchProfile, event, matchResult);
                    newMatches.add(match);
                    logger.info("New match found: job={}, title='{}', user={}, score={}%", 
                            jobPost.getUniqueId(), jobPost.getTitle(), userId, matchResult.totalScore);
                }
            } catch (Exception e) {
                logger.error("Error matching job {} for user {}: {}", 
                        jobPost.getUniqueId(), userId, e.getMessage(), e);
            }
        }
        
        // Send notifications for premium users
        if (!newMatches.isEmpty()) {
            sendNotificationsForMatches(userId, newMatches);
        }
        
        logger.info("On-demand matching complete: {} new matches for user {}", newMatches.size(), userId);
        return newMatches;
    }

    /**
     * Send notifications for matched job posts to premium users
     * Called after on-demand matching
     */
    private void sendNotificationsForMatches(String userId, List<MatchedJobPost> matches) {
        try {
            // Check if user has active premium subscription
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findByUserId(userId);
            
            if (subscriptionOpt.isEmpty()) {
                logger.debug("No subscription found for user {} - skipping notifications", userId);
                return;
            }
            
            Subscription subscription = subscriptionOpt.get();
            if (subscription.getPlanType() != PlanType.PREMIUM || 
                subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                logger.debug("User {} is not premium or subscription not active - skipping notifications", userId);
                return;
            }
            
            logger.info("Sending {} notifications to premium user {}", matches.size(), userId);
            
            for (MatchedJobPost match : matches) {
                if (match.getIsNotified() != null && match.getIsNotified()) {
                    continue; // Already notified
                }
                
                try {
                    // Build match data metadata for View Details modal
                    Map<String, Object> matchData = buildMatchDataForNotification(match);
                    
                    // Create notification request
                    NotificationRequest notificationRequest = new NotificationRequest(
                            userId,
                            String.format("New Job Match! %.0f%% Match", match.getMatchScore()),
                            String.format("Job: %s in %s. Matched skills: %s",
                                    match.getJobTitle(),
                                    match.getLocation() != null ? match.getLocation() : "Unknown",
                                    match.getMatchedSkills() != null ? 
                                        String.join(", ", match.getMatchedSkills()) : "N/A"),
                            "JOB_MATCH",
                            matchData
                    );
                    
                    // Save notification to DB and send via WebSocket
                    notificationExternalService.sendNotification(notificationRequest);
                    
                    // Mark as notified
                    match.setIsNotified(true);
                    matchedJobPostRepository.save(match);
                    
                    logger.info("Sent notification to premium user {} for job {}", userId, match.getJobPostId());
                } catch (Exception e) {
                    logger.error("Failed to send notification for job {}: {}", match.getJobPostId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error sending notifications for user {}: {}", userId, e.getMessage(), e);
        }
    }

    /**
     * Build metadata for job match notification
     */
    private Map<String, Object> buildMatchDataForNotification(MatchedJobPost match) {
        Map<String, Object> matchData = new HashMap<>();
        
        // Job info
        matchData.put("jobPostId", match.getJobPostId());
        matchData.put("jobTitle", match.getJobTitle());
        matchData.put("jobDescription", match.getJobDescription());
        matchData.put("location", match.getLocation());
        matchData.put("employmentTypes", match.getEmploymentTypes());
        
        // Salary info
        matchData.put("salaryMin", match.getSalaryMin());
        matchData.put("salaryMax", match.getSalaryMax());
        matchData.put("salaryCurrency", match.getSalaryCurrency() != null ? match.getSalaryCurrency() : "USD");
        
        // Skills match info
        matchData.put("requiredSkills", match.getRequiredSkills());
        matchData.put("matchedSkills", match.getMatchedSkills());
        
        // Overall match score
        matchData.put("matchScore", match.getMatchScore());
        
        // Score breakdown
        matchData.put("skillsScore", match.getSkillsScore() != null ? match.getSkillsScore() : 0);
        matchData.put("salaryScore", match.getSalaryScore() != null ? match.getSalaryScore() : 0);
        matchData.put("locationScore", match.getLocationScore() != null ? match.getLocationScore() : 0);
        matchData.put("employmentScore", match.getEmploymentScore() != null ? match.getEmploymentScore() : 0);
        matchData.put("titleScore", match.getTitleScore() != null ? match.getTitleScore() : 0);
        
        // Dates
        matchData.put("postedDate", match.getPostedDate());
        matchData.put("expiryDate", match.getExpiryDate());
        
        return matchData;
    }
    
    /**
     * Convert JobPostDto from JM API to JobPostEvent for matching algorithm
     */
    private JobPostEvent convertToJobPostEvent(JobPostDto dto) {
        JobPostEvent event = new JobPostEvent();
        event.setId(dto.getUniqueId());
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setLocation(dto.getLocation());
        event.setEmploymentType(dto.getEmploymentType());
        event.setSkills(dto.getRequiredSkills());
        event.setStatus("published"); // Active jobs are published
        event.setPostedDate(parseDate(dto.getPostedDate()));
        event.setExpiryDate(parseDate(dto.getExpiryDate()));
        event.setIsFresherFriendly(dto.getIsFresherFriendly());
        
        // Convert salary
        if (dto.getMinSalary() != null || dto.getMaxSalary() != null) {
            JobPostEvent.SalaryInfo salary = new JobPostEvent.SalaryInfo();
            salary.setMin(dto.getMinSalary() != null ? BigDecimal.valueOf(dto.getMinSalary()) : null);
            salary.setMax(dto.getMaxSalary() != null ? BigDecimal.valueOf(dto.getMaxSalary()) : null);
            salary.setCurrency(dto.getSalaryCurrency());
            event.setSalary(salary);
        }
        
        return event;
    }
    
    /**
     * Parse date string to Instant
     */
    private Instant parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        try {
            return Instant.parse(dateStr);
        } catch (Exception e) {
            logger.debug("Could not parse date '{}': {}", dateStr, e.getMessage());
            return null;
        }
    }
}

