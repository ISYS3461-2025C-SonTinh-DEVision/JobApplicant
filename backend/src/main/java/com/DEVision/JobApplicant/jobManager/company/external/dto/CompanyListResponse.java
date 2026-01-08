package com.DEVision.JobApplicant.jobManager.company.external.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for paginated Company list response from JM system
 * Matches the actual API response structure:
 * {
 *   "items": [...],
 *   "meta": {
 *     "total": 5,
 *     "page": 1,
 *     "limit": 10,
 *     "pages": 1
 *   }
 * }
 */
public class CompanyListResponse implements Serializable {

    private List<CompanyDto> items;

    private Meta meta;

    public CompanyListResponse() {
    }

    // Convenience methods to access nested data
    public List<CompanyDto> getCompanies() {
        return items;
    }

    public Integer getTotalCount() {
        return meta != null ? meta.getTotal() : null;
    }

    public Integer getPage() {
        return meta != null ? meta.getPage() : null;
    }

    public Integer getTotalPages() {
        return meta != null ? meta.getPages() : null;
    }

    public Integer getLimit() {
        return meta != null ? meta.getLimit() : null;
    }

    // Getters and Setters
    public List<CompanyDto> getItems() {
        return items;
    }

    public void setItems(List<CompanyDto> items) {
        this.items = items;
    }

    public Meta getMeta() {
        return meta;
    }

    public void setMeta(Meta meta) {
        this.meta = meta;
    }

    /**
     * Inner class for pagination metadata
     */
    public static class Meta implements Serializable {
        private Integer total;
        private Integer page;
        private Integer limit;
        private Integer pages;

        public Meta() {
        }

        public Integer getTotal() {
            return total;
        }

        public void setTotal(Integer total) {
            this.total = total;
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

        public Integer getPages() {
            return pages;
        }

        public void setPages(Integer pages) {
            this.pages = pages;
        }
    }
}
