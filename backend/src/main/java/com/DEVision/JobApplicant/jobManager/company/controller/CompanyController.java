package com.DEVision.JobApplicant.jobManager.company.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.DEVision.JobApplicant.jobManager.company.external.dto.*;
import com.DEVision.JobApplicant.jobManager.company.service.CallCompanyService;

/**
 * REST API Controller for Company integration
 * Exposes endpoints for frontend to access companies from JM system
 *
 * Base path: /api/jm/company
 * This follows the pattern for JM integrations (different from /api/companies for general use)
 */
@RestController
@RequestMapping("/api/jm/company")
@Tag(name = "Company Management (JM Integration)",
     description = "Endpoints for accessing and managing companies from JM system")
public class CompanyController {

    @Autowired
    private CallCompanyService callCompanyService;

    @Operation(
        summary = "Get all companies",
        description = "Retrieve companies from JM system with optional filtering, searching, and pagination. " +
                      "Supports query parameters: " +
                      "Pagination: page (default: 1), limit (default: 10); " +
                      "Filters: search, name, country, city"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Companies retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    public ResponseEntity<CompanyListResponseDto> getCompanies(
            @ParameterObject CompanySearchRequest searchRequest) {
        CompanyListResponse response = callCompanyService.searchCompanies(
                searchRequest.withDefaults()
        );
        return ResponseEntity.ok(CompanyListResponseDto.from(response));
    }

    @Operation(
        summary = "Get company by ID",
        description = "Retrieve a specific company detail by ID from JM system"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Company retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Company not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyDto> getCompanyById(
            @Parameter(description = "Company ID")
            @PathVariable String companyId) {
        CompanyDto company = callCompanyService.getCompanyById(companyId);
        if (company != null) {
            return ResponseEntity.ok(company);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(
        summary = "Activate company account",
        description = "Activate a company account in JM system. Admin-only operation."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account activated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid account ID"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/{accountId}/activate")
    public ResponseEntity<AccountActionResponse> activateAccount(
            @Parameter(description = "Account ID to activate")
            @PathVariable String accountId) {
        AccountActionResponse response = callCompanyService.activateAccount(accountId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "Deactivate company account",
        description = "Deactivate a company account in JM system. Admin-only operation."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Account deactivated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid account ID"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/{accountId}/deactivate")
    public ResponseEntity<AccountActionResponse> deactivateAccount(
            @Parameter(description = "Account ID to deactivate")
            @PathVariable String accountId) {
        AccountActionResponse response = callCompanyService.deactivateAccount(accountId);
        return ResponseEntity.ok(response);
    }
}
