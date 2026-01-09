package com.DEVision.JobApplicant.applicant.internal.dto;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for profile view statistics
 */
public class ProfileViewStatsResponse {
    
    private long totalViews;
    private long viewsThisWeek;
    private long viewsThisMonth;
    private long viewsToday;
    private double trendPercentage; // +/- % compared to last period
    private String trendDirection; // "up", "down", "stable"
    private List<DailyViewCount> dailyViews;
    private List<RecentViewer> recentViewers;
    
    // Inner class for daily view counts
    public static class DailyViewCount {
        private String date;
        private long count;
        
        public DailyViewCount() {}
        
        public DailyViewCount(String date, long count) {
            this.date = date;
            this.count = count;
        }
        
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
    
    // Inner class for recent viewers
    public static class RecentViewer {
        private String viewerType;
        private String viewerName;
        private Instant viewedAt;
        
        public RecentViewer() {}
        
        public RecentViewer(String viewerType, String viewerName, Instant viewedAt) {
            this.viewerType = viewerType;
            this.viewerName = viewerName;
            this.viewedAt = viewedAt;
        }
        
        public String getViewerType() { return viewerType; }
        public void setViewerType(String viewerType) { this.viewerType = viewerType; }
        public String getViewerName() { return viewerName; }
        public void setViewerName(String viewerName) { this.viewerName = viewerName; }
        public Instant getViewedAt() { return viewedAt; }
        public void setViewedAt(Instant viewedAt) { this.viewedAt = viewedAt; }
    }
    
    // Constructors
    public ProfileViewStatsResponse() {}
    
    // Getters and Setters
    public long getTotalViews() {
        return totalViews;
    }

    public void setTotalViews(long totalViews) {
        this.totalViews = totalViews;
    }

    public long getViewsThisWeek() {
        return viewsThisWeek;
    }

    public void setViewsThisWeek(long viewsThisWeek) {
        this.viewsThisWeek = viewsThisWeek;
    }

    public long getViewsThisMonth() {
        return viewsThisMonth;
    }

    public void setViewsThisMonth(long viewsThisMonth) {
        this.viewsThisMonth = viewsThisMonth;
    }

    public long getViewsToday() {
        return viewsToday;
    }

    public void setViewsToday(long viewsToday) {
        this.viewsToday = viewsToday;
    }

    public double getTrendPercentage() {
        return trendPercentage;
    }

    public void setTrendPercentage(double trendPercentage) {
        this.trendPercentage = trendPercentage;
    }

    public String getTrendDirection() {
        return trendDirection;
    }

    public void setTrendDirection(String trendDirection) {
        this.trendDirection = trendDirection;
    }

    public List<DailyViewCount> getDailyViews() {
        return dailyViews;
    }

    public void setDailyViews(List<DailyViewCount> dailyViews) {
        this.dailyViews = dailyViews;
    }

    public List<RecentViewer> getRecentViewers() {
        return recentViewers;
    }

    public void setRecentViewers(List<RecentViewer> recentViewers) {
        this.recentViewers = recentViewers;
    }
}
