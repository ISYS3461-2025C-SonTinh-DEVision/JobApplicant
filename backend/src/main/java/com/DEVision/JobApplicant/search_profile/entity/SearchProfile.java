package com.DEVision.JobApplicant.search_profile.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.DEVision.JobApplicant.search_profile.EmploymentType;

@Setter
@Getter
@Document(collection = "search_profiles")
public class SearchProfile {

    @Id
    private String id;

    private String userId;
    private String profileName;
    private List<String> desiredSkills;
    private List<EmploymentType> employmentTypes;
    private List<String> jobTitles;
    private String desiredCountry;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;

    @CreatedDate
    @Field("created_at")
    private Instant createdAt;

    public SearchProfile() {
    }

}

