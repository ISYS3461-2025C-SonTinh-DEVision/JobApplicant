package com.DEVision.JobApplicant.subscription.controller;

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

import com.DEVision.JobApplicant.subscription.dto.CreateSkillRequest;
import com.DEVision.JobApplicant.subscription.dto.SearchProfileDto;
import com.DEVision.JobApplicant.subscription.dto.SearchProfileRequest;
import com.DEVision.JobApplicant.subscription.dto.SkillDto;
import com.DEVision.JobApplicant.subscription.service.SearchProfileService;
import com.DEVision.JobApplicant.subscription.service.SkillService;

import jakarta.validation.Valid;

@Validated
@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SkillService skillService;
    private final SearchProfileService searchProfileService;

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

    @PostMapping("/search-profiles")
    public ResponseEntity<SearchProfileDto> createSearchProfile(
            @RequestParam String userId,
            @Valid @RequestBody SearchProfileRequest request) {
        SearchProfileDto profile = searchProfileService.createSearchProfile(userId, request);
        return new ResponseEntity<>(profile, HttpStatus.CREATED);
    }

    @GetMapping("/search-profiles")
    public ResponseEntity<List<SearchProfileDto>> getSearchProfiles(@RequestParam String userId) {
        List<SearchProfileDto> profiles = searchProfileService.getSearchProfilesByUserId(userId);
        return ResponseEntity.ok(profiles);
    }

    @PutMapping("/search-profiles/{id}")
    public ResponseEntity<SearchProfileDto> updateSearchProfile(
            @PathVariable String id,
            @RequestParam String userId,
            @Valid @RequestBody SearchProfileRequest request) {
        SearchProfileDto profile = searchProfileService.updateSearchProfile(id, userId, request);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/search-profiles/{id}")
    public ResponseEntity<Void> deleteSearchProfile(
            @PathVariable String id,
            @RequestParam String userId) {
        searchProfileService.deleteSearchProfile(id, userId);
        return ResponseEntity.noContent().build();
    }
}

