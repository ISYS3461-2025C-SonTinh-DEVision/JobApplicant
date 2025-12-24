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
import org.springframework.web.multipart.MultipartFile;

import com.DEVision.JobApplicant.applicant.internal.dto.AddEducationRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddSkillRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddSkillsRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.AddWorkExperienceRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.EducationResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateEducationRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateProfileRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.UpdateWorkExperienceRequest;
import com.DEVision.JobApplicant.applicant.internal.dto.WorkExperienceResponse;
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

    // ===== /api/me Endpoints - Current User Operations =====

    @Operation(
        summary = "Get my profile",
        description = "Retrieve current authenticated user's profile. Uses JWT token to identify user."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Profile not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        try {
            ProfileResponse profile = internalService.getMyProfile();
            return new ResponseEntity<>(profile, HttpStatus.OK);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error fetching my profile: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Update my profile",
        description = "Update current authenticated user's profile information"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request data"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Profile not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            @Parameter(description = "Updated profile information")
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            ProfileResponse updated = internalService.updateMyProfile(request);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("Error updating my profile: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Add education to my profile",
        description = "Add a new education entry to current user's profile. Maximum 20 entries allowed."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Education added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or max limit reached"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/me/education")
    public ResponseEntity<?> addMyEducation(
            @Parameter(description = "Education entry details")
            @Valid @RequestBody AddEducationRequest request) {
        try {
            EducationResponse education = internalService.addMyEducation(request);
            return new ResponseEntity<>(education, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error adding education: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Update education in my profile",
        description = "Update an existing education entry in current user's profile"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Education updated successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Education not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PutMapping("/me/education/{educationId}")
    public ResponseEntity<?> updateMyEducation(
            @Parameter(description = "Education entry ID")
            @PathVariable String educationId,
            @Parameter(description = "Updated education details")
            @Valid @RequestBody UpdateEducationRequest request) {
        try {
            EducationResponse education = internalService.updateMyEducation(educationId, request);
            if (education != null) {
                return new ResponseEntity<>(education, HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error updating education: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Delete education from my profile",
        description = "Remove an education entry from current user's profile"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Education deleted successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Education not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/me/education/{educationId}")
    public ResponseEntity<Map<String, String>> deleteMyEducation(
            @Parameter(description = "Education entry ID")
            @PathVariable String educationId) {
        try {
            boolean deleted = internalService.deleteMyEducation(educationId);
            Map<String, String> response = new HashMap<>();

            if (deleted) {
                response.put("message", "Education entry deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Education entry not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error deleting education: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Add work experience to my profile",
        description = "Add a new work experience entry to current user's profile. Maximum 20 entries allowed."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Work experience added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or max limit reached"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/me/work-experience")
    public ResponseEntity<?> addMyWorkExperience(
            @Parameter(description = "Work experience details")
            @Valid @RequestBody AddWorkExperienceRequest request) {
        try {
            WorkExperienceResponse workExperience = internalService.addMyWorkExperience(request);
            return new ResponseEntity<>(workExperience, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error adding work experience: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Update work experience in my profile",
        description = "Update an existing work experience entry in current user's profile"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Work experience updated successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Work experience not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PutMapping("/me/work-experience/{workExperienceId}")
    public ResponseEntity<?> updateMyWorkExperience(
            @Parameter(description = "Work experience entry ID")
            @PathVariable String workExperienceId,
            @Parameter(description = "Updated work experience details")
            @Valid @RequestBody UpdateWorkExperienceRequest request) {
        try {
            WorkExperienceResponse workExperience = internalService.updateMyWorkExperience(workExperienceId, request);
            if (workExperience != null) {
                return new ResponseEntity<>(workExperience, HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error updating work experience: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Delete work experience from my profile",
        description = "Remove a work experience entry from current user's profile"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Work experience deleted successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Work experience not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/me/work-experience/{workExperienceId}")
    public ResponseEntity<Map<String, String>> deleteMyWorkExperience(
            @Parameter(description = "Work experience entry ID")
            @PathVariable String workExperienceId) {
        try {
            boolean deleted = internalService.deleteMyWorkExperience(workExperienceId);
            Map<String, String> response = new HashMap<>();

            if (deleted) {
                response.put("message", "Work experience entry deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Work experience entry not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error deleting work experience: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Add skill to my profile",
        description = "Add a single skill to current user's profile. Maximum 50 skills allowed."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Skill added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request, max limit reached, or duplicate skill"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/me/skills")
    public ResponseEntity<?> addMySkill(
            @Parameter(description = "Skill to add")
            @Valid @RequestBody AddSkillRequest request) {
        try {
            ProfileResponse profile = internalService.addMySkill(request);
            return new ResponseEntity<>(profile, HttpStatus.OK);
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error adding skill: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Add multiple skills to my profile",
        description = "Add multiple skills to current user's profile at once. Maximum 50 skills total."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Skills added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or max limit would be exceeded"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/me/skills/batch")
    public ResponseEntity<?> addMySkills(
            @Parameter(description = "Skills to add")
            @Valid @RequestBody AddSkillsRequest request) {
        try {
            ProfileResponse profile = internalService.addMySkills(request);
            return new ResponseEntity<>(profile, HttpStatus.OK);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error adding skills: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Delete skill from my profile",
        description = "Remove a skill from current user's profile. Case-insensitive matching."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Skill deleted successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Skill not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/me/skills/{skill}")
    public ResponseEntity<?> deleteMySkill(
            @Parameter(description = "Skill to remove")
            @PathVariable String skill) {
        try {
            ProfileResponse profile = internalService.deleteMySkill(skill);
            if (profile != null) {
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
            Map<String, String> error = new HashMap<>();
            error.put("message", "Skill not found in profile");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error deleting skill: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Operation(
        summary = "Upload avatar to my profile",
        description = "Upload or update current user's profile avatar image. Max size 5MB. Supported formats: JPG, PNG, WEBP"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Avatar uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file or file too large"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadMyAvatar(
            @Parameter(description = "Avatar image file")
            @RequestParam("file") MultipartFile file) {
        try {
            ProfileResponse profile = internalService.uploadMyAvatar(file);
            return new ResponseEntity<>(profile, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("Error uploading avatar: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== Legacy Endpoints (require applicant ID) =====

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
    
    // ===== Education Endpoints =====
    
    @Operation(
        summary = "Add education entry",
        description = "Add a new education entry to applicant profile. Maximum 20 entries allowed."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Education added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or max limit reached"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/{id}/education")
    public ResponseEntity<?> addEducation(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Education entry details")
            @Valid @RequestBody AddEducationRequest request) {
        try {
            EducationResponse education = internalService.addEducation(id, request);
            if (education != null) {
                return new ResponseEntity<>(education, HttpStatus.CREATED);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error adding education: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Update education entry",
        description = "Update an existing education entry"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Education updated successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant or education not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PutMapping("/{id}/education/{educationId}")
    public ResponseEntity<?> updateEducation(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Education entry ID")
            @PathVariable String educationId,
            @Parameter(description = "Updated education details")
            @Valid @RequestBody UpdateEducationRequest request) {
        try {
            EducationResponse education = internalService.updateEducation(id, educationId, request);
            if (education != null) {
                return new ResponseEntity<>(education, HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error updating education: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Delete education entry",
        description = "Remove an education entry from profile"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Education deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant or education not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/{id}/education/{educationId}")
    public ResponseEntity<Map<String, String>> deleteEducation(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Education entry ID")
            @PathVariable String educationId) {
        try {
            boolean deleted = internalService.deleteEducation(id, educationId);
            Map<String, String> response = new HashMap<>();
            
            if (deleted) {
                response.put("message", "Education entry deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Education entry not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error deleting education: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ===== Work Experience Endpoints =====
    
    @Operation(
        summary = "Add work experience entry",
        description = "Add a new work experience entry to applicant profile. Maximum 20 entries allowed."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Work experience added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or max limit reached"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/{id}/work-experience")
    public ResponseEntity<?> addWorkExperience(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Work experience details")
            @Valid @RequestBody AddWorkExperienceRequest request) {
        try {
            WorkExperienceResponse workExperience = internalService.addWorkExperience(id, request);
            if (workExperience != null) {
                return new ResponseEntity<>(workExperience, HttpStatus.CREATED);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error adding work experience: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Update work experience entry",
        description = "Update an existing work experience entry"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Work experience updated successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant or work experience not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PutMapping("/{id}/work-experience/{workExperienceId}")
    public ResponseEntity<?> updateWorkExperience(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Work experience entry ID")
            @PathVariable String workExperienceId,
            @Parameter(description = "Updated work experience details")
            @Valid @RequestBody UpdateWorkExperienceRequest request) {
        try {
            WorkExperienceResponse workExperience = internalService.updateWorkExperience(id, workExperienceId, request);
            if (workExperience != null) {
                return new ResponseEntity<>(workExperience, HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error updating work experience: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Delete work experience entry",
        description = "Remove a work experience entry from profile"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Work experience deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant or work experience not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/{id}/work-experience/{workExperienceId}")
    public ResponseEntity<Map<String, String>> deleteWorkExperience(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Work experience entry ID")
            @PathVariable String workExperienceId) {
        try {
            boolean deleted = internalService.deleteWorkExperience(id, workExperienceId);
            Map<String, String> response = new HashMap<>();
            
            if (deleted) {
                response.put("message", "Work experience entry deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                response.put("message", "Work experience entry not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error deleting work experience: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ===== Avatar Upload Endpoint =====
    
    @Operation(
        summary = "Upload profile avatar",
        description = "Upload or update profile avatar image. Max size 5MB. Supported formats: JPG, PNG, WEBP"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Avatar uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file or file too large"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Avatar image file")
            @RequestParam("file") MultipartFile file) {
        try {
            ProfileResponse profile = internalService.uploadAvatar(id, file);
            if (profile != null) {
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error uploading avatar: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // ===== Skills Endpoints =====
    
    @Operation(
        summary = "Add a skill",
        description = "Add a single skill to applicant profile. Maximum 50 skills allowed. Case-insensitive duplicate check."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Skill added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request, max limit reached, or duplicate skill"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/{id}/skills")
    public ResponseEntity<?> addSkill(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Skill to add")
            @Valid @RequestBody AddSkillRequest request) {
        try {
            ProfileResponse profile = internalService.addSkill(id, request);
            if (profile != null) {
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error adding skill: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Add multiple skills",
        description = "Add multiple skills to applicant profile at once. Maximum 50 skills total."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Skills added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or max limit would be exceeded"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @PostMapping("/{id}/skills/batch")
    public ResponseEntity<?> addSkills(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Skills to add")
            @Valid @RequestBody AddSkillsRequest request) {
        try {
            ProfileResponse profile = internalService.addSkills(id, request);
            if (profile != null) {
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error adding skills: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @Operation(
        summary = "Delete a skill",
        description = "Remove a skill from profile. Case-insensitive matching."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Skill deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Not authorized to modify this profile"),
        @ApiResponse(responseCode = "404", description = "Applicant or skill not found"),
        @ApiResponse(responseCode = "500", description = "Server error")
    })
    @DeleteMapping("/{id}/skills/{skill}")
    public ResponseEntity<?> deleteSkill(
            @Parameter(description = "Applicant ID")
            @PathVariable String id,
            @Parameter(description = "Skill to remove")
            @PathVariable String skill) {
        try {
            ProfileResponse profile = internalService.deleteSkill(id, skill);
            if (profile != null) {
                return new ResponseEntity<>(profile, HttpStatus.OK);
            }
            Map<String, String> error = new HashMap<>();
            error.put("message", "Skill not found in profile");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        } catch (SecurityException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            System.err.println("Error deleting skill: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
