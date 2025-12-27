package com.DEVision.JobApplicant.applicant.internal.dto;

import java.util.List;

/**
 * Response DTO for portfolio (images and videos)
 */
public class PortfolioResponse {
    
    private List<PortfolioItemResponse> images;
    private List<PortfolioItemResponse> videos;
    private int maxImages;
    private int maxVideos;
    private int currentImageCount;
    private int currentVideoCount;

    public PortfolioResponse() {}

    public PortfolioResponse(List<PortfolioItemResponse> images, List<PortfolioItemResponse> videos,
                            int maxImages, int maxVideos) {
        this.images = images;
        this.videos = videos;
        this.maxImages = maxImages;
        this.maxVideos = maxVideos;
        this.currentImageCount = images != null ? images.size() : 0;
        this.currentVideoCount = videos != null ? videos.size() : 0;
    }

    // Getters and Setters
    public List<PortfolioItemResponse> getImages() {
        return images;
    }

    public void setImages(List<PortfolioItemResponse> images) {
        this.images = images;
        this.currentImageCount = images != null ? images.size() : 0;
    }

    public List<PortfolioItemResponse> getVideos() {
        return videos;
    }

    public void setVideos(List<PortfolioItemResponse> videos) {
        this.videos = videos;
        this.currentVideoCount = videos != null ? videos.size() : 0;
    }

    public int getMaxImages() {
        return maxImages;
    }

    public void setMaxImages(int maxImages) {
        this.maxImages = maxImages;
    }

    public int getMaxVideos() {
        return maxVideos;
    }

    public void setMaxVideos(int maxVideos) {
        this.maxVideos = maxVideos;
    }

    public int getCurrentImageCount() {
        return currentImageCount;
    }

    public void setCurrentImageCount(int currentImageCount) {
        this.currentImageCount = currentImageCount;
    }

    public int getCurrentVideoCount() {
        return currentVideoCount;
    }

    public void setCurrentVideoCount(int currentVideoCount) {
        this.currentVideoCount = currentVideoCount;
    }
}




