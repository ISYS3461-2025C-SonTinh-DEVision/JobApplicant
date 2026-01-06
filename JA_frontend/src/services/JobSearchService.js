/**
 * Job Search Service
 * Handles interactions with the Job API via JA Backend proxy
 * 
 * Architecture: A.2.c - REST HTTP Helper Class pattern
 * Security: Calls JA backend proxy instead of direct JM API
 */

import { mockApiClient } from './mockApiClient';
import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';
import { transformJobPost, transformJobPostListResponse } from '../utils/jobTransformers';

// Flag to track if we should use mock (set automatically on API failure)
let useMockFallback = false;

const JobSearchService = {
    /**
     * Reset mock fallback flag (useful for retry)
     */
    resetMockFallback: () => {
        useMockFallback = false;
    },

    /**
     * Check if using mock data
     */
    isUsingMock: () => useMockFallback,

    /**
     * Search jobs with filters - Uses REAL API via JA backend proxy
     * Falls back to mock data if API unavailable
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} List of jobs with {data, total, page, totalPages}
     */
    getJobs: async (filters = {}) => {
        // Try real API first (unless we already know it's down)
        if (!useMockFallback) {
            try {
                // Build query params for JA backend proxy
                const queryParams = {
                    page: filters.page || 1,
                    size: filters.size || filters.limit || 10,
                };

                // Add search filter
                if (filters.search) {
                    queryParams.search = filters.search;
                }

                // Add location filter
                if (filters.location) {
                    queryParams.location = filters.location;
                }

                // Add employment type filter
                if (filters.employmentType) {
                    // Handle array or string
                    queryParams.employmentType = Array.isArray(filters.employmentType)
                        ? filters.employmentType.join(',')
                        : filters.employmentType;
                }

                // Add salary filters
                if (filters.minSalary) {
                    queryParams.minSalary = filters.minSalary;
                }
                if (filters.maxSalary) {
                    queryParams.maxSalary = filters.maxSalary;
                }

                // Add fresher filter
                if (filters.fresher === true) {
                    queryParams.fresherFriendly = true;
                }

                // Call JA backend proxy endpoint
                const response = await httpUtil.get('/api/job-posts', queryParams);

                // Transform response to frontend format
                const result = transformJobPostListResponse(response);

                console.log('[JobSearchService] Fetched real job data:', result.total, 'jobs');
                return result;

            } catch (error) {
                console.warn('[JobSearchService] Real API failed, falling back to mock:', error.message);
                useMockFallback = true;
            }
        }

        // Fallback to mock data
        return JobSearchService._getMockJobs(filters);
    },

    /**
     * Get mock jobs (internal fallback)
     */
    _getMockJobs: async (filters = {}) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            const response = await mockApiClient.get('/jobs');
            let jobs = response.data || [];

            // Apply filters
            if (filters.search) {
                const term = filters.search.toLowerCase();
                jobs = jobs.filter(job =>
                    job.title?.toLowerCase().includes(term) ||
                    job.company?.toLowerCase().includes(term) ||
                    job.description?.toLowerCase().includes(term)
                );
            }

            if (filters.employmentType && filters.employmentType.length > 0) {
                const types = Array.isArray(filters.employmentType)
                    ? filters.employmentType
                    : [filters.employmentType];
                jobs = jobs.filter(job => types.includes(job.employmentType));
            }

            if (filters.location) {
                const locTerm = filters.location.toLowerCase();
                jobs = jobs.filter(job =>
                    job.location?.toLowerCase().includes(locTerm)
                );
            }

            if (filters.fresher === true) {
                jobs = jobs.filter(job => job.fresher === true);
            }

            // Pagination
            const page = filters.page || 1;
            const size = filters.size || 10;
            const total = jobs.length;
            const start = (page - 1) * size;
            const paginatedJobs = jobs.slice(start, start + size);

            return {
                data: paginatedJobs.map(transformJobPost),
                total,
                page,
                totalPages: Math.ceil(total / size),
                isMock: true,
            };
        } catch (error) {
            console.error('[JobSearchService] Mock data also failed:', error);
            return { data: [], total: 0, page: 1, totalPages: 0, isMock: true };
        }
    },

    /**
     * Get job details by ID - Uses REAL API via JA backend proxy
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Job details
     */
    getJobById: async (id) => {
        if (!useMockFallback) {
            try {
                const response = await httpUtil.get(`/api/job-posts/${id}`);

                // Handle different response structures
                const job = response?.data || response;
                return transformJobPost(job);

            } catch (error) {
                console.warn('[JobSearchService] Real API failed for job detail:', error.message);
                useMockFallback = true;
            }
        }

        // Fallback to mock
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            const response = await mockApiClient.get(`/jobs/${id}`);
            return transformJobPost(response.data);
        } catch (error) {
            console.error('[JobSearchService] Mock data also failed:', error);
            return null;
        }
    },

    /**
     * Apply for a job
     * @param {string} jobId - Job ID
     * @param {Object} applicationData - Application data
     * @returns {Promise<Object>} Application result
     */
    applyToJob: async (jobId, applicationData) => {
        try {
            return httpUtil.post(API_ENDPOINTS.JOBS.APPLY, { jobId, ...applicationData });
        } catch (error) {
            console.error('Error applying to job:', error);
            throw error;
        }
    }
};

export default JobSearchService;
