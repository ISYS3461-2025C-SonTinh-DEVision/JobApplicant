package com.DEVision.JobApplicant.searchProfile.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;
import com.DEVision.JobApplicant.searchProfile.dto.CreateSkillRequest;
import com.DEVision.JobApplicant.searchProfile.dto.SearchProfileDto;
import com.DEVision.JobApplicant.searchProfile.dto.SearchProfileRequest;
import com.DEVision.JobApplicant.searchProfile.dto.SkillDto;
import com.DEVision.JobApplicant.searchProfile.entity.MatchedJobPost;
import com.DEVision.JobApplicant.searchProfile.service.MatchedJobPostService;
import com.DEVision.JobApplicant.searchProfile.service.SearchProfileService;
import com.DEVision.JobApplicant.searchProfile.service.SkillService;
import com.DEVision.JobApplicant.searchProfile.service.JobMatchingService;
import com.DEVision.JobApplicant.notification.external.dto.NotificationRequest;
import com.DEVision.JobApplicant.notification.external.service.NotificationExternalService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/search-profiles")
@RequiredArgsConstructor
public class SearchProfileController {

    private final SkillService skillService;
    private final SearchProfileService searchProfileService;
    private final MatchedJobPostService matchedJobPostService;
    private final AuthRepository authRepository;
    private final NotificationExternalService notificationService;
    private final JobMatchingService jobMatchingService;

    // ===== Helper method to get current user ID from JWT =====
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }
        String username = authentication.getName();
        User user = authRepository.findByEmail(username);
        if (user == null) {
            throw new SecurityException("User not found: " + username);
        }
        return user.getId();
    }

    // ===== /me Endpoints - Current User Operations =====

    /**
     * Get search profile for current authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMySearchProfile() {
        try {
            String userId = getCurrentUserId();
            System.out.println("========== DEBUG: GET /me endpoint called ==========");
            System.out.println("DEBUG: userId = " + userId);
            List<SearchProfileDto> profiles = searchProfileService.getSearchProfilesByUserId(userId);
            System.out.println("DEBUG: profiles found = " + (profiles != null ? profiles.size() : "null"));
            // Return first profile or empty object if none exists
            if (profiles != null && !profiles.isEmpty()) {
                System.out.println("DEBUG: Returning profile = " + profiles.get(0));
                return ResponseEntity.ok(profiles.get(0));
            }
            System.out.println("DEBUG: No profile found, returning empty");
            // Return 204 No Content instead of null to clearly indicate no profile
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Create or update search profile for current authenticated user
     */
    @PostMapping("/me")
    public ResponseEntity<?> createMySearchProfile(@Valid @RequestBody SearchProfileRequest request) {
        System.out.println("========== DEBUG: POST /me endpoint called ==========");
        System.out.println("Request: " + request);
        try {
            String userId = getCurrentUserId();
            System.out.println("DEBUG: userId = " + userId);
            // Check if profile already exists
            List<SearchProfileDto> existingProfiles = searchProfileService.getSearchProfilesByUserId(userId);
            SearchProfileDto profile;
            if (existingProfiles != null && !existingProfiles.isEmpty()) {
                // Update existing profile
                profile = searchProfileService.updateSearchProfile(existingProfiles.get(0).id(), userId, request);
            } else {
                // Create new profile
                profile = searchProfileService.createSearchProfile(userId, request);
            }
            return new ResponseEntity<>(profile, HttpStatus.CREATED);
        } catch (SecurityException e) {
            System.out.println("DEBUG: SecurityException - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("DEBUG: Exception - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Update search profile for current authenticated user
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMySearchProfile(@Valid @RequestBody SearchProfileRequest request) {
        try {
            String userId = getCurrentUserId();
            List<SearchProfileDto> existingProfiles = searchProfileService.getSearchProfilesByUserId(userId);
            if (existingProfiles != null && !existingProfiles.isEmpty()) {
                SearchProfileDto profile = searchProfileService.updateSearchProfile(
                        existingProfiles.get(0).id(), userId, request);
                return ResponseEntity.ok(profile);
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Delete search profile for current authenticated user
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMySearchProfile() {
        try {
            String userId = getCurrentUserId();
            List<SearchProfileDto> existingProfiles = searchProfileService.getSearchProfilesByUserId(userId);
            if (existingProfiles != null && !existingProfiles.isEmpty()) {
                searchProfileService.deleteSearchProfile(existingProfiles.get(0).id(), userId);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    /**
     * Check for job matches for current authenticated user
     * This endpoint triggers on-demand job matching: fetches NEW jobs from JM API
     * (posted after search profile creation), runs matching algorithm, and returns NEW matches only.
     * (Requirement 5.3.1: match incoming NEW job posts against subscriber criteria)
     */
    @PostMapping("/me/check-matches")
    public ResponseEntity<?> checkMyJobMatches() {
        System.out.println("========== DEBUG: POST /me/check-matches endpoint called ==========");
        try {
            String userId = getCurrentUserId();
            System.out.println("DEBUG: userId = " + userId);
            
            // Trigger on-demand job matching (only matches jobs posted AFTER profile creation)
            List<MatchedJobPost> newMatches = jobMatchingService.checkMatchesForUser(userId);
            System.out.println("DEBUG: On-demand matching found " + newMatches.size() + " new matches");
            
            // Return ONLY the new matches from this check (not all historical matches)
            return ResponseEntity.ok(newMatches);
        } catch (SecurityException e) {
            System.out.println("DEBUG: SecurityException - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("DEBUG: Exception - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    /**
     * Get all matched jobs for current user (history view)
     * Returns all matches including viewed ones
     */
    @GetMapping("/me/matched-jobs")
    public ResponseEntity<?> getMyMatchedJobs() {
        try {
            String userId = getCurrentUserId();
            List<MatchedJobPost> matchedJobs = matchedJobPostService.getMatchedJobPostsByUserId(userId);
            return ResponseEntity.ok(matchedJobs);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    
    /**
     * Clear all matched jobs for current user (for testing/reset)
     */
    @DeleteMapping("/me/matched-jobs")
    public ResponseEntity<?> clearMyMatchedJobs() {
        try {
            String userId = getCurrentUserId();
            matchedJobPostService.deleteMatchedJobsByUserId(userId);
            return ResponseEntity.ok().body("Matched jobs cleared successfully");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    /**
     * Simulate a job match for testing purposes
     * Creates a simulated job post that matches the user's search profile and triggers matching
     */
    @PostMapping("/me/simulate-job-match")
    public ResponseEntity<?> simulateJobMatch() {
        System.out.println("========== DEBUG: POST /me/simulate-job-match endpoint called ==========");
        try {
            String userId = getCurrentUserId();
            System.out.println("DEBUG: userId = " + userId);
            
            // Get user's search profile
            List<SearchProfileDto> profiles = searchProfileService.getSearchProfilesByUserId(userId);
            if (profiles == null || profiles.isEmpty()) {
                return ResponseEntity.badRequest().body("No search profile found. Please create a search profile first.");
            }
            
            SearchProfileDto profile = profiles.get(0);
            System.out.println("DEBUG: Found profile with skills: " + profile.desiredSkills());
            
            // Create a simulated job post that matches the user's profile
            MatchedJobPost simulatedMatch = new MatchedJobPost();
            simulatedMatch.setUserId(userId);
            simulatedMatch.setJobPostId("sim-" + System.currentTimeMillis());
            simulatedMatch.setJobTitle(profile.jobTitles() != null && !profile.jobTitles().isEmpty() 
                ? profile.jobTitles().get(0) + " at Tech Startup"
                : "Software Engineer at Tech Startup");
            simulatedMatch.setJobDescription("This is a simulated job post for testing the notification system. " +
                "The job matches your search profile preferences.");
            simulatedMatch.setLocation(profile.desiredCountry() != null ? profile.desiredCountry() : "Vietnam");
            simulatedMatch.setRequiredSkills(profile.desiredSkills());
            simulatedMatch.setMatchedSkills(profile.desiredSkills());
            simulatedMatch.setMatchScore(85.0 + Math.random() * 15); // 85-100% match
            simulatedMatch.setSalaryMin(profile.minSalary());
            simulatedMatch.setSalaryMax(profile.maxSalary());
            simulatedMatch.setSalaryCurrency("USD");
            simulatedMatch.setPostedDate(java.time.Instant.now());
            simulatedMatch.setIsNotified(false);
            simulatedMatch.setIsViewed(false);
            
            // Convert employment types for display
            if (profile.employmentTypes() != null && !profile.employmentTypes().isEmpty()) {
                simulatedMatch.setEmploymentTypes(
                    profile.employmentTypes().stream()
                        .map(et -> et.name())
                        .collect(java.util.stream.Collectors.toList())
                );
            }
            
            // Save the simulated match
            MatchedJobPost saved = matchedJobPostService.saveMatchedJobPost(simulatedMatch);
            System.out.println("DEBUG: Saved simulated match with id: " + saved.getId());
            
            // Create a notification for this job match
            try {
                NotificationRequest notifRequest = new NotificationRequest();
                notifRequest.setUserId(userId);
                notifRequest.setTitle("New Job Match! " + String.format("%.0f%%", saved.getMatchScore()) + " Match");
                notifRequest.setContent("Job: " + saved.getJobTitle() + " in " + saved.getLocation() + 
                    ". Matched skills: " + (saved.getMatchedSkills() != null ? String.join(", ", saved.getMatchedSkills()) : "N/A"));
                notifRequest.setType("JOB_MATCH");
                notificationService.sendNotification(notifRequest);
                System.out.println("DEBUG: Notification sent for job match");
            } catch (Exception notifEx) {
                System.err.println("DEBUG: Failed to send notification: " + notifEx.getMessage());
                // Continue - notification failure shouldn't fail the match
            }
            
            return ResponseEntity.ok(saved);
        } catch (SecurityException e) {
            System.out.println("DEBUG: SecurityException - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            System.out.println("DEBUG: Exception - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // ===== Legacy Endpoints with userId parameter =====

    @PostMapping("/skills")
    public ResponseEntity<SkillDto> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        SkillDto skill = skillService.createSkill(request);
        return new ResponseEntity<>(skill, HttpStatus.CREATED);
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillDto>> getSkills() {
        List<SkillDto> skills = skillService.getAllSkills();
        return ResponseEntity.ok(skills);
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable String id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<SearchProfileDto> createSearchProfile(
            @RequestParam String userId,
            @Valid @RequestBody SearchProfileRequest request) {
        SearchProfileDto profile = searchProfileService.createSearchProfile(userId, request);
        return new ResponseEntity<>(profile, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SearchProfileDto>> getSearchProfiles(@RequestParam String userId) {
        List<SearchProfileDto> profiles = searchProfileService.getSearchProfilesByUserId(userId);
        return ResponseEntity.ok(profiles);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SearchProfileDto> updateSearchProfile(
            @PathVariable String id,
            @RequestParam String userId,
            @Valid @RequestBody SearchProfileRequest request) {
        SearchProfileDto profile = searchProfileService.updateSearchProfile(id, userId, request);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSearchProfile(
            @PathVariable String id,
            @RequestParam String userId) {
        searchProfileService.deleteSearchProfile(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ===== Matched Job Posts Endpoints =====

    /**
     * Get all matched job posts for a user
     */
    @GetMapping("/matched-jobs")
    public ResponseEntity<List<MatchedJobPost>> getMatchedJobPosts(@RequestParam String userId) {
        List<MatchedJobPost> matchedJobPosts = matchedJobPostService.getMatchedJobPostsByUserId(userId);
        return ResponseEntity.ok(matchedJobPosts);
    }

    /**
     * Get unviewed matched job posts for a user
     */
    @GetMapping("/matched-jobs/unviewed")
    public ResponseEntity<List<MatchedJobPost>> getUnviewedMatchedJobPosts(@RequestParam String userId) {
        List<MatchedJobPost> matchedJobPosts = matchedJobPostService.getUnviewedMatchedJobPosts(userId);
        return ResponseEntity.ok(matchedJobPosts);
    }

    /**
     * Mark a matched job post as viewed
     */
    @PutMapping("/matched-jobs/{id}/view")
    public ResponseEntity<MatchedJobPost> markMatchedJobPostAsViewed(@PathVariable String id) {
        MatchedJobPost matchedJobPost = matchedJobPostService.markAsViewed(id);
        if (matchedJobPost != null) {
            return ResponseEntity.ok(matchedJobPost);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Get a specific matched job post by ID
     */
    @GetMapping("/matched-jobs/{id}")
    public ResponseEntity<MatchedJobPost> getMatchedJobPostById(@PathVariable String id) {
        return matchedJobPostService.getMatchedJobPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
