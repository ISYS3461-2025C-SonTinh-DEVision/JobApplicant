package com.DEVision.JobApplicant.admin.dto;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for paginated applicant list response
 */
public class ApplicantListResponseDto implements Serializable {

    private List<ApplicantListItemDto> data;
    private Integer total;
    private Integer page;
    private Integer limit;
    private Integer totalPages;

    public ApplicantListResponseDto() {
    }

    public ApplicantListResponseDto(List<ApplicantListItemDto> data, Integer total,
                                   Integer page, Integer limit, Integer totalPages) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = totalPages;
    }

    // Getters and Setters
    public List<ApplicantListItemDto> getData() {
        return data;
    }

    public void setData(List<ApplicantListItemDto> data) {
        this.data = data;
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

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }
}
