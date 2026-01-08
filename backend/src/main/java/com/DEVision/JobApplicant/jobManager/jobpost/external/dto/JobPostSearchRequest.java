package com.DEVision.JobApplicant.jobManager.jobpost.external.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Request DTO for searching/filtering job posts
 * Supports all query parameters that the JM API accepts
 * Optimized for frontend filter integration
 */
public class JobPostSearchRequest implements Serializable {
    
    // Pagination parameters
    private Integer page;
    private Integer size; // Frontend uses 'size', converted to 'limit' for JM API
    
    // Filtering parameters
    private String status;
    private String location;
    private List<String> employmentType; // Support multiple selections
    private String companyId;
    private Double minSalary;
    private Double maxSalary;
    private String currency;
    private Boolean fresherFriendly; // Fresher-friendly filter
    
    // Search parameters
    private String search;
    private String title;
    private String skill;
    private String category;
    
    // Sorting parameters
    private String sortBy;
    private String sortOrder; // "asc" or "desc"
    
    // Date range parameters
    private String postedAfter;
    private String postedBefore;
    private String expiresAfter;
    private String expiresBefore;
    
    // Additional filters
    private Integer minApplicationCount;
    private Integer maxApplicationCount;
    
    // Default values
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    
    public JobPostSearchRequest() {
    }
    
    /**
     * Apply default values to the request if not set
     * @return This request with defaults applied
     */
    public JobPostSearchRequest withDefaults() {
        if (page == null) {
            this.page = DEFAULT_PAGE;
        }
        if (size == null) {
            this.size = DEFAULT_SIZE;
        }
        return this;
    }
    
    /**
     * Convert this request to a Map of query parameters
     * Only includes non-null and non-empty values
     * Handles List types properly for multiple values
     * Converts 'size' to 'limit' for JM API compatibility
     */
    public Map<String, Object> toQueryParams() {
        Map<String, Object> params = new HashMap<>();
        
        // Pagination - convert 'size' to 'limit' for JM API
        // Enforce minimum limit of 20 (JM API requirement)
        if (page != null) params.put("page", page);
        int limit = (size != null) ? Math.max(size, 20) : 20;
        params.put("limit", limit);
        
        // Filters
        if (status != null && !status.trim().isEmpty()) {
            params.put("status", status);
        }
        if (location != null && !location.trim().isEmpty()) {
            params.put("location", location);
        }
        if (employmentType != null && !employmentType.isEmpty()) {
            // Handle multiple employment types - Spring will convert List to multiple query params
            params.put("employmentType", employmentType);
        }
        if (companyId != null && !companyId.trim().isEmpty()) {
            params.put("companyId", companyId);
        }
        if (minSalary != null) {
            params.put("minSalary", minSalary);
        }
        if (maxSalary != null) {
            params.put("maxSalary", maxSalary);
        }
        if (currency != null && !currency.trim().isEmpty()) {
            params.put("currency", currency);
        }
        if (fresherFriendly != null && fresherFriendly) {
            params.put("isFresher", fresherFriendly);
        }
        
        // Search
        if (search != null && !search.trim().isEmpty()) {
            params.put("search", search);
        }
        if (title != null && !title.trim().isEmpty()) {
            params.put("title", title);
        }
        if (skill != null && !skill.trim().isEmpty()) {
            params.put("skill", skill);
        }
        if (category != null && !category.trim().isEmpty()) {
            params.put("category", category);
        }
        
        // Sorting
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            params.put("sortBy", sortBy);
        }
        if (sortOrder != null && !sortOrder.trim().isEmpty()) {
            params.put("sortOrder", sortOrder);
        }
        
        // Date ranges
        if (postedAfter != null && !postedAfter.trim().isEmpty()) {
            params.put("postedAfter", postedAfter);
        }
        if (postedBefore != null && !postedBefore.trim().isEmpty()) {
            params.put("postedBefore", postedBefore);
        }
        if (expiresAfter != null && !expiresAfter.trim().isEmpty()) {
            params.put("expiresAfter", expiresAfter);
        }
        if (expiresBefore != null && !expiresBefore.trim().isEmpty()) {
            params.put("expiresBefore", expiresBefore);
        }
        
        // Application count filters
        if (minApplicationCount != null) {
            params.put("minApplicationCount", minApplicationCount);
        }
        if (maxApplicationCount != null) {
            params.put("maxApplicationCount", maxApplicationCount);
        }
        
        return params;
    }
    
    // Builder pattern for easy construction
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private JobPostSearchRequest request = new JobPostSearchRequest();
        
        public Builder page(Integer page) {
            request.page = page;
            return this;
        }
        
        public Builder size(Integer size) {
            request.size = size;
            return this;
        }
        
        public Builder status(String status) {
            request.status = status;
            return this;
        }
        
        public Builder location(String location) {
            request.location = location;
            return this;
        }
        
        public Builder employmentType(String employmentType) {
            if (request.employmentType == null) {
                request.employmentType = new ArrayList<>();
            }
            if (employmentType != null && !request.employmentType.contains(employmentType)) {
                request.employmentType.add(employmentType);
            }
            return this;
        }
        
        public Builder employmentTypes(List<String> employmentTypes) {
            request.employmentType = employmentTypes != null ? new ArrayList<>(employmentTypes) : null;
            return this;
        }
        
        public Builder companyId(String companyId) {
            request.companyId = companyId;
            return this;
        }
        
        public Builder minSalary(Double minSalary) {
            request.minSalary = minSalary;
            return this;
        }
        
        public Builder maxSalary(Double maxSalary) {
            request.maxSalary = maxSalary;
            return this;
        }
        
        public Builder salaryRange(Double min, Double max) {
            request.minSalary = min;
            request.maxSalary = max;
            return this;
        }
        
        public Builder currency(String currency) {
            request.currency = currency;
            return this;
        }
        
        public Builder fresherFriendly(Boolean fresherFriendly) {
            request.fresherFriendly = fresherFriendly;
            return this;
        }
        
        public Builder search(String search) {
            request.search = search;
            return this;
        }
        
        public Builder title(String title) {
            request.title = title;
            return this;
        }
        
        public Builder skill(String skill) {
            request.skill = skill;
            return this;
        }
        
        public Builder category(String category) {
            request.category = category;
            return this;
        }
        
        public Builder sortBy(String sortBy) {
            request.sortBy = sortBy;
            return this;
        }
        
        public Builder sortOrder(String sortOrder) {
            request.sortOrder = sortOrder;
            return this;
        }
        
        public Builder postedAfter(String postedAfter) {
            request.postedAfter = postedAfter;
            return this;
        }
        
        public Builder postedBefore(String postedBefore) {
            request.postedBefore = postedBefore;
            return this;
        }
        
        public Builder expiresAfter(String expiresAfter) {
            request.expiresAfter = expiresAfter;
            return this;
        }
        
        public Builder expiresBefore(String expiresBefore) {
            request.expiresBefore = expiresBefore;
            return this;
        }
        
        public Builder minApplicationCount(Integer minApplicationCount) {
            request.minApplicationCount = minApplicationCount;
            return this;
        }
        
        public Builder maxApplicationCount(Integer maxApplicationCount) {
            request.maxApplicationCount = maxApplicationCount;
            return this;
        }
        
        public JobPostSearchRequest build() {
            return request.withDefaults();
        }
    }
    
    // Getters and Setters
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }
    
    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public List<String> getEmploymentType() { return employmentType; }
    public void setEmploymentType(List<String> employmentType) { this.employmentType = employmentType; }
    
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    
    public Double getMinSalary() { return minSalary; }
    public void setMinSalary(Double minSalary) { this.minSalary = minSalary; }
    
    public Double getMaxSalary() { return maxSalary; }
    public void setMaxSalary(Double maxSalary) { this.maxSalary = maxSalary; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Boolean getFresherFriendly() { return fresherFriendly; }
    public void setFresherFriendly(Boolean fresherFriendly) { this.fresherFriendly = fresherFriendly; }
    
    public String getSearch() { return search; }
    public void setSearch(String search) { this.search = search; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    
    public String getSortOrder() { return sortOrder; }
    public void setSortOrder(String sortOrder) { this.sortOrder = sortOrder; }
    
    public String getPostedAfter() { return postedAfter; }
    public void setPostedAfter(String postedAfter) { this.postedAfter = postedAfter; }
    
    public String getPostedBefore() { return postedBefore; }
    public void setPostedBefore(String postedBefore) { this.postedBefore = postedBefore; }
    
    public String getExpiresAfter() { return expiresAfter; }
    public void setExpiresAfter(String expiresAfter) { this.expiresAfter = expiresAfter; }
    
    public String getExpiresBefore() { return expiresBefore; }
    public void setExpiresBefore(String expiresBefore) { this.expiresBefore = expiresBefore; }
    
    public Integer getMinApplicationCount() { return minApplicationCount; }
    public void setMinApplicationCount(Integer minApplicationCount) { this.minApplicationCount = minApplicationCount; }
    
    public Integer getMaxApplicationCount() { return maxApplicationCount; }
    public void setMaxApplicationCount(Integer maxApplicationCount) { this.maxApplicationCount = maxApplicationCount; }
}

