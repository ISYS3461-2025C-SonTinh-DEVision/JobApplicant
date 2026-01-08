package com.DEVision.JobApplicant.jobManager.jobpost.external.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for paginated Job Post list response from JM system
 * Matches the actual API response structure:
 * {
 *   "statusCode": 200,
 *   "message": "...",
 *   "data": {
 *     "data": [...],
 *     "meta": {
 *       "page": 1,
 *       "limit": 25,
 *       "total": 5,
 *       "totalPages": 1
 *     }
 *   }
 * }
 */
public class JobPostListResponse implements Serializable {
    
    @JsonProperty("statusCode")
    private Integer statusCode;
    
    private String message;
    
    private DataWrapper data;
    
    public JobPostListResponse() {
    }
    
    // Convenience methods to access nested data
    public List<JobPostDto> getJobs() {
        return data != null && data.getData() != null ? data.getData() : null;
    }
    
    public Integer getTotalCount() {
        return data != null && data.getMeta() != null ? data.getMeta().getTotal() : null;
    }
    
    public Integer getPage() {
        return data != null && data.getMeta() != null ? data.getMeta().getPage() : null;
    }
    
    public Integer getTotalPages() {
        return data != null && data.getMeta() != null ? data.getMeta().getTotalPages() : null;
    }
    
    // Getters and Setters
    public Integer getStatusCode() {
        return statusCode;
    }
    
    public void setStatusCode(Integer statusCode) {
        this.statusCode = statusCode;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public DataWrapper getData() {
        return data;
    }
    
    public void setData(DataWrapper data) {
        this.data = data;
    }
    
    /**
     * Inner class for data wrapper
     */
    public static class DataWrapper implements Serializable {
        private List<JobPostDto> data;
        private Meta meta;
        
        public DataWrapper() {
        }
        
        public List<JobPostDto> getData() {
            return data;
        }
        
        public void setData(List<JobPostDto> data) {
            this.data = data;
        }
        
        public Meta getMeta() {
            return meta;
        }
        
        public void setMeta(Meta meta) {
            this.meta = meta;
        }
    }
    
    /**
     * Inner class for pagination metadata
     */
    public static class Meta implements Serializable {
        private Integer page;
        private Integer limit;
        private Integer total;
        
        @JsonProperty("totalPages")
        private Integer totalPages;
        
        public Meta() {
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
        
        public Integer getTotal() {
            return total;
        }
        
        public void setTotal(Integer total) {
            this.total = total;
        }
        
        public Integer getTotalPages() {
            return totalPages;
        }
        
        public void setTotalPages(Integer totalPages) {
            this.totalPages = totalPages;
        }
    }
}
