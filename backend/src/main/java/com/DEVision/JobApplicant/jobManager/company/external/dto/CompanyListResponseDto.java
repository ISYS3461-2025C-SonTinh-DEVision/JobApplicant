package com.DEVision.JobApplicant.jobManager.company.external.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

/**
 * Simplified DTO for frontend response
 * Transforms the JM API response into a cleaner structure for JA frontend
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CompanyListResponseDto implements Serializable {

    private List<CompanyDto> companies;

    @JsonProperty("totalCount")
    private Integer totalCount;

    private Integer page;

    private Integer limit;

    @JsonProperty("totalPages")
    private Integer totalPages;

    public CompanyListResponseDto() {
    }

    public CompanyListResponseDto(List<CompanyDto> companies, Integer totalCount,
                                  Integer page, Integer limit, Integer totalPages) {
        this.companies = companies;
        this.totalCount = totalCount;
        this.page = page;
        this.limit = limit;
        this.totalPages = totalPages;
    }

    // Factory method to create from JM API response
    public static CompanyListResponseDto from(CompanyListResponse response) {
        if (response == null) {
            return new CompanyListResponseDto(null, null, null, null, null);
        }
        return new CompanyListResponseDto(
            response.getCompanies(),
            response.getTotalCount(),
            response.getPage(),
            response.getLimit(),
            response.getTotalPages()
        );
    }

    // Getters and Setters
    public List<CompanyDto> getCompanies() {
        return companies;
    }

    public void setCompanies(List<CompanyDto> companies) {
        this.companies = companies;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }
}
