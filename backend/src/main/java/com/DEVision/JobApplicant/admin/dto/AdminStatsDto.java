package com.DEVision.JobApplicant.admin.dto;

import java.io.Serializable;

/**
 * DTO for admin dashboard statistics
 */
public class AdminStatsDto implements Serializable {

    private Long totalApplicants;
    private Long totalCompanies;
    private Long totalJobPosts;
    private Long activeUsers;
    private Long premiumApplicants;
    private Long premiumCompanies;

    public AdminStatsDto() {
    }

    public AdminStatsDto(Long totalApplicants, Long totalCompanies, Long totalJobPosts,
                         Long activeUsers, Long premiumApplicants, Long premiumCompanies) {
        this.totalApplicants = totalApplicants;
        this.totalCompanies = totalCompanies;
        this.totalJobPosts = totalJobPosts;
        this.activeUsers = activeUsers;
        this.premiumApplicants = premiumApplicants;
        this.premiumCompanies = premiumCompanies;
    }

    // Getters and Setters
    public Long getTotalApplicants() {
        return totalApplicants;
    }

    public void setTotalApplicants(Long totalApplicants) {
        this.totalApplicants = totalApplicants;
    }

    public Long getTotalCompanies() {
        return totalCompanies;
    }

    public void setTotalCompanies(Long totalCompanies) {
        this.totalCompanies = totalCompanies;
    }

    public Long getTotalJobPosts() {
        return totalJobPosts;
    }

    public void setTotalJobPosts(Long totalJobPosts) {
        this.totalJobPosts = totalJobPosts;
    }

    public Long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public Long getPremiumApplicants() {
        return premiumApplicants;
    }

    public void setPremiumApplicants(Long premiumApplicants) {
        this.premiumApplicants = premiumApplicants;
    }

    public Long getPremiumCompanies() {
        return premiumCompanies;
    }

    public void setPremiumCompanies(Long premiumCompanies) {
        this.premiumCompanies = premiumCompanies;
    }
}
