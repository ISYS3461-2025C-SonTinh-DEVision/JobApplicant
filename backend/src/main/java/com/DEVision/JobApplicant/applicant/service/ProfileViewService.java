package com.DEVision.JobApplicant.applicant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.DEVision.JobApplicant.applicant.entity.Applicant;
import com.DEVision.JobApplicant.applicant.entity.ProfileView;
import com.DEVision.JobApplicant.applicant.entity.ProfileView.ViewerType;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileViewStatsResponse;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileViewStatsResponse.DailyViewCount;
import com.DEVision.JobApplicant.applicant.internal.dto.ProfileViewStatsResponse.RecentViewer;
import com.DEVision.JobApplicant.applicant.repository.ApplicantRepository;
import com.DEVision.JobApplicant.applicant.repository.ProfileViewRepository;
import com.DEVision.JobApplicant.auth.entity.User;
import com.DEVision.JobApplicant.auth.repository.AuthRepository;

import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for tracking and retrieving profile view statistics
 * 
 * Tracks when external systems (Job Manager, Companies) view applicant profiles
 */
@Service
public class ProfileViewService {
    
    @Autowired
    private ProfileViewRepository profileViewRepository;
    
    @Autowired
    private ApplicantRepository applicantRepository;
    
    @Autowired
    private AuthRepository authRepository;
    
    // Minimum interval between counting views from same viewer (5 minutes)
    private static final int DUPLICATE_VIEW_THRESHOLD_MINUTES = 5;
    
    /**
     * Record a profile view event
     * Called when /api/applicants/{id} is accessed
     */
    public void recordProfileView(String applicantId, String viewerId, ViewerType viewerType, 
                                   String userAgent, String ipAddress) {
        // Skip if this is a self-view (applicant viewing their own profile)
        if (isSelfView(applicantId)) {
            return;
        }
        
        // Check for duplicate views within threshold
        Instant threshold = Instant.now().minus(DUPLICATE_VIEW_THRESHOLD_MINUTES, ChronoUnit.MINUTES);
        String effectiveViewerId = viewerId != null ? viewerId : hashIp(ipAddress);
        
        boolean recentView = profileViewRepository.existsByApplicantIdAndViewerIdAndViewedAtAfter(
            applicantId, effectiveViewerId, threshold);
        
        if (recentView) {
            return; // Don't count duplicate views
        }
        
        // Create and save the view record
        ProfileView view = new ProfileView(applicantId, effectiveViewerId, viewerType);
        view.setUserAgent(userAgent);
        view.setIpHash(hashIp(ipAddress));
        
        profileViewRepository.save(view);
    }
    
    /**
     * Check if current user is viewing their own profile
     */
    private boolean isSelfView(String applicantId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return false;
            }
            
            String email = auth.getName();
            User user = authRepository.findByEmail(email);
            if (user == null) {
                return false;
            }
            
            Applicant applicant = applicantRepository.findByUserId(user.getId());
            return applicant != null && applicant.getId().equals(applicantId);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get profile view statistics for current authenticated user
     */
    public ProfileViewStatsResponse getMyProfileViewStats() {
        String applicantId = getCurrentApplicantId();
        if (applicantId == null) {
            throw new SecurityException("User not authenticated or no applicant profile found");
        }
        
        return getProfileViewStats(applicantId);
    }
    
    /**
     * Get profile view statistics for a specific applicant
     */
    public ProfileViewStatsResponse getProfileViewStats(String applicantId) {
        ProfileViewStatsResponse stats = new ProfileViewStatsResponse();
        
        Instant now = Instant.now();
        Instant todayStart = now.truncatedTo(ChronoUnit.DAYS);
        Instant weekStart = now.minus(7, ChronoUnit.DAYS);
        Instant monthStart = now.minus(30, ChronoUnit.DAYS);
        Instant lastWeekStart = now.minus(14, ChronoUnit.DAYS);
        
        // Get counts
        long totalViews = profileViewRepository.countByApplicantId(applicantId);
        long viewsToday = profileViewRepository.countByApplicantIdAndViewedAtAfter(applicantId, todayStart);
        long viewsThisWeek = profileViewRepository.countByApplicantIdAndViewedAtAfter(applicantId, weekStart);
        long viewsThisMonth = profileViewRepository.countByApplicantIdAndViewedAtAfter(applicantId, monthStart);
        
        // Calculate trend (compare this week vs last week)
        long viewsLastWeek = profileViewRepository.countByApplicantIdAndViewedAtBetween(
            applicantId, lastWeekStart, weekStart);
        
        double trendPercentage = 0;
        String trendDirection = "stable";
        if (viewsLastWeek > 0) {
            trendPercentage = ((double)(viewsThisWeek - viewsLastWeek) / viewsLastWeek) * 100;
            trendDirection = trendPercentage > 5 ? "up" : (trendPercentage < -5 ? "down" : "stable");
        } else if (viewsThisWeek > 0) {
            trendPercentage = 100;
            trendDirection = "up";
        }
        
        // Get daily view counts for the last 7 days
        List<DailyViewCount> dailyViews = getDailyViewCounts(applicantId, 7);
        
        // Get recent viewers (last 10)
        List<ProfileView> recentViews = profileViewRepository.findByApplicantIdOrderByViewedAtDesc(applicantId);
        List<RecentViewer> recentViewers = recentViews.stream()
            .limit(10)
            .map(view -> new RecentViewer(
                view.getViewerType() != null ? view.getViewerType().name() : "ANONYMOUS",
                view.getViewerType() == ViewerType.COMPANY ? "Company" : "Job Manager",
                view.getViewedAt()
            ))
            .collect(Collectors.toList());
        
        // Build response
        stats.setTotalViews(totalViews);
        stats.setViewsToday(viewsToday);
        stats.setViewsThisWeek(viewsThisWeek);
        stats.setViewsThisMonth(viewsThisMonth);
        stats.setTrendPercentage(Math.round(trendPercentage * 10.0) / 10.0);
        stats.setTrendDirection(trendDirection);
        stats.setDailyViews(dailyViews);
        stats.setRecentViewers(recentViewers);
        
        return stats;
    }
    
    /**
     * Get daily view counts for the specified number of days
     */
    private List<DailyViewCount> getDailyViewCounts(String applicantId, int days) {
        List<DailyViewCount> dailyViews = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            Instant dayStart = date.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant dayEnd = date.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            
            long count = profileViewRepository.countByApplicantIdAndViewedAtBetween(
                applicantId, dayStart, dayEnd);
            
            dailyViews.add(new DailyViewCount(date.format(formatter), count));
        }
        
        return dailyViews;
    }
    
    /**
     * Get current authenticated user's applicant ID
     */
    private String getCurrentApplicantId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return null;
            }
            
            String email = auth.getName();
            User user = authRepository.findByEmail(email);
            if (user == null) {
                return null;
            }
            
            Applicant applicant = applicantRepository.findByUserId(user.getId());
            return applicant != null ? applicant.getId() : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Hash IP address for privacy
     */
    private String hashIp(String ipAddress) {
        if (ipAddress == null) {
            return "unknown";
        }
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(ipAddress.getBytes());
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) { // Only use first 8 bytes for short hash
                sb.append(String.format("%02x", hash[i]));
            }
            return sb.toString();
        } catch (Exception e) {
            return ipAddress.substring(0, Math.min(8, ipAddress.length()));
        }
    }
}
