package com.DEVision.JobApplicant.search_profile.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import com.DEVision.JobApplicant.search_profile.dto.CreateSkillRequest;
import com.DEVision.JobApplicant.search_profile.dto.SearchProfileDto;
import com.DEVision.JobApplicant.search_profile.dto.SearchProfileRequest;
import com.DEVision.JobApplicant.search_profile.dto.SkillDto;
import com.DEVision.JobApplicant.search_profile.entity.MatchedJobPost;
import com.DEVision.JobApplicant.search_profile.service.MatchedJobPostService;
import com.DEVision.JobApplicant.search_profile.service.SearchProfileService;
import com.DEVision.JobApplicant.search_profile.service.SkillService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/search-profiles")
@RequiredArgsConstructor
public class SearchProfileController {

    private final SkillService skillService;
    private final SearchProfileService searchProfileService;
    private final MatchedJobPostService matchedJobPostService;

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

