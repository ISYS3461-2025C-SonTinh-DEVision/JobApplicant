package com.DEVision.JobApplicant.applicant.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.DEVision.JobApplicant.applicant.internal.dto.ProfileResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateProfileRequest;
import com.DEVision.JobApplicant.applicant.internal.service.ApplicantInternalService;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * REST API for applicant profile management
 */
@RestController
@RequestMapping("/api/applicants")
@Tag(name = "Applicant Profile Management",
     description = "Endpoints for managing applicant profiles")
public class ApplicantController {

    @Autowired
    private ApplicantInternalService internalService;

    @Operation(
        summary = "Get profile by user ID",
        description = "Retrieve applicant profile information by user ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Profile not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<ProfileResponse> getProfileByUserId(
            @Parameter(description = "User ID to fetch profile for")
            @PathVariable String userId) {
        try {
            ProfileResponse profile = internalService.getProfile(userId);
            if (profile != null) {
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error fetching profile: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Get profile by ID",
        description = "Retrieve applicant profile information by applicant ID"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Profile not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProfileResponse> getProfileById(
            @Parameter(description = "Applicant ID to fetch profile for")
            @PathVariable String id) {
        try {
            ProfileResponse profile = internalService.getProfileById(id);
            if (profile != null) {
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error fetching profile: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Update profile",
        description = "Update applicant profile information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "404", description = "Profile not found"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProfileResponse> updateProfile(
            @Parameter(description = "Applicant ID to update")
            @PathVariable String id,
            @Parameter(description = "Updated profile information")
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            ProfileResponse updated = internalService.updateProfile(id, request);
            if (updated != null) {
                return new ResponseEntity<>(updated, HttpStatus.OK);
            }
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Delete profile",
        description = "Delete applicant profile. Use with caution - this cannot be undone."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Profile not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProfile(
            @Parameter(description = "Applicant ID to delete")
            @PathVariable String id) {
        try {
            boolean deleted = internalService.deleteProfile(id);
            Map<String, String> response = new HashMap<>();

            if (deleted) {
                response.put("message", "Profile deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Profile not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.err.println("Error deleting profile: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
