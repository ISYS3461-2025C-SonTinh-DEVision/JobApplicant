package com.DEVision.JobApplicant.jobManager.company.external.dto;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * Request DTO for searching/filtering companies
 * Supports query parameters that the JM Company API accepts
 */
public class CompanySearchRequest implements Serializable {

    // Pagination parameters
    private Integer page;
    private Integer limit;

    // Search/filter parameters
    private String search;
    private String name;
    private String country;
    private String city;

    // Default values
    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_LIMIT = 10;

    public CompanySearchRequest() {
    }

    /**
     * Apply default values to the request if not set
     * @return This request with defaults applied
     */
    public CompanySearchRequest withDefaults() {
        if (page == null) {
            this.page = DEFAULT_PAGE;
        }
        if (limit == null) {
            this.limit = DEFAULT_LIMIT;
        }
        return this;
    }

    /**
     * Convert this request to a Map of query parameters
     * Only includes non-null and non-empty values
     */
    public Map<String, Object> toQueryParams() {
        Map<String, Object> params = new HashMap<>();

        // Pagination
        if (page != null) params.put("page", page);
        if (limit != null) params.put("limit", limit);

        // Filters
        if (search != null && !search.trim().isEmpty()) {
            params.put("search", search);
        }
        if (name != null && !name.trim().isEmpty()) {
            params.put("name", name);
        }
        if (country != null && !country.trim().isEmpty()) {
            params.put("country", country);
        }
        if (city != null && !city.trim().isEmpty()) {
            params.put("city", city);
        }

        return params;
    }

    // Getters and Setters
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }

    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }

    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
