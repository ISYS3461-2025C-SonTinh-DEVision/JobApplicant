package com.DEVision.JobApplicant.activity.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.DEVision.JobApplicant.activity.internal.dto.ActivityResponse;
import com.DEVision.JobApplicant.activity.service.ActivityService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Activity endpoints
 * Provides API for retrieving user activities for Dashboard
 */
@RestController
@RequestMapping("/api/activities")
@Tag(name = "Activity Management", description = "Endpoints for user activity tracking")
public class ActivityController {
    
    @Autowired
    private ActivityService activityService;
    
    @Operation(
        summary = "Get my recent activities",
        description = "Retrieve recent activities for the current authenticated user. Used for Dashboard's Recent Activity section."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Activities retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getMyActivities(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            List<ActivityResponse> activities = activityService.getMyRecentActivities(Math.min(limit, 50));
            return ResponseEntity.ok(activities);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error fetching activities: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve activities");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Get my activities by category",
        description = "Retrieve activities filtered by category (profile, security, subscription, applications)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Activities retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/me/category/{category}")
    public ResponseEntity<?> getMyActivitiesByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            List<ActivityResponse> activities = activityService.getMyActivitiesByCategory(
                category, Math.min(limit, 50));
            return ResponseEntity.ok(activities);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error fetching activities by category: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to retrieve activities");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
