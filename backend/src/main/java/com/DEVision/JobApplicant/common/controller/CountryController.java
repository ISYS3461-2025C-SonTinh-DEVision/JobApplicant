package com.DEVision.JobApplicant.common.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.DEVision.JobApplicant.common.model.Country;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/countries")
@CrossOrigin(origins = "https://localhost:3000")
public class CountryController {
    
    /**
     * Get list of all available countries for dropdown
     * This endpoint is public and doesn't require authentication
     */
    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getAllCountries() {
        List<Map<String, String>> countries = new ArrayList<>();
        
        for (Country country : Country.values()) {
            Map<String, String> countryInfo = new HashMap<>();
            countryInfo.put("value", country.name()); // Enum name (e.g., "VIETNAM")
            countryInfo.put("label", country.getDisplayName()); // Display name (e.g., "Vietnam")
            countryInfo.put("code", country.getCode()); // Country code (e.g., "VN")
            countries.add(countryInfo);
        }
        
        return new ResponseEntity<>(countries, HttpStatus.OK);
    }
}

