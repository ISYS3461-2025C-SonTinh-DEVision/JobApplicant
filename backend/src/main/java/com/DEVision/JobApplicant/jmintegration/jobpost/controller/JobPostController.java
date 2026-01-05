package com.DEVision.JobApplicant.jmintegration.jobpost.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostDto;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostListResponse;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostListResponseDto;
import com.DEVision.JobApplicant.jmintegration.jobpost.external.dto.JobPostSearchRequest;
import com.DEVision.JobApplicant.jmintegration.jobpost.service.CallJobPostService;

/**
 * REST API Controller for Job Post integration
 * Exposes endpoints for frontend to access job posts from JM system
 */
@RestController
@RequestMapping("/api/job-posts")
@Tag(name = "Job Post Management",
     description = "Endpoints for accessing job posts from JM system")
public class JobPostController {
    
    @Autowired
    private CallJobPostService callJobPostService;
    
    @Operation(
        summary = "Get all job posts",
        description = "Retrieve job posts from JM system with optional filtering, searching, and pagination. " +
                      "Supports query parameters: " +
                      "Pagination: page (default: 0), size (default: 20, converted to 'limit' for JM API); " +
                      "Filters: status, location, employmentType (supports multiple values), " +
                      "minSalary, maxSalary, currency, fresherFriendly; " +
                      "Search: search, title, skill, category; " +
                      "Sorting: sortBy, sortOrder (asc/desc); " +
                      "Date ranges: postedAfter, postedBefore, expiresAfter, expiresBefore; " +
                      "Application count: minApplicationCount, maxApplicationCount."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Job posts retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    public ResponseEntity<JobPostListResponseDto> getJobPosts(
            @ParameterObject JobPostSearchRequest searchRequest) {
        JobPostListResponse response = callJobPostService.searchJobPosts(
                searchRequest.withDefaults()
        );
        return ResponseEntity.ok(JobPostListResponseDto.from(response));
    }
    
    @Operation(
        summary = "Get job post by ID",
        description = "Retrieve a specific job post detail by ID from JM system"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Job post retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Job post not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{jobPostId}")
    public ResponseEntity<JobPostDto> getJobPostById(
            @Parameter(description = "Job post ID")
            @PathVariable String jobPostId) {
        JobPostDto jobPost = callJobPostService.getJobPostById(jobPostId);
        if (jobPost != null) {
            return ResponseEntity.ok(jobPost);
        }
        return ResponseEntity.notFound().build();
    }
}

