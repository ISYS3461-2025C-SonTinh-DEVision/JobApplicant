
/**
 * Job Search Service
 * Handles interactions with the Job API
 */

import { mockApiClient } from './mockApiClient';
import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

const USE_MOCK = true; // Toggle this to switch between Real API and Mock

const JobSearchService = {
    /**
     * Search jobs with filters
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} List of jobs
     */
    getJobs: async (filters = {}) => {
        try {
            if (USE_MOCK) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 800));
                const response = await mockApiClient.get('/jobs');

                let jobs = response.data;

                // 1. Text Search
                if (filters.search) {
                    const term = filters.search.toLowerCase();
                    jobs = jobs.filter(job =>
                        job.title.toLowerCase().includes(term) ||
                        job.company.toLowerCase().includes(term)
                    );
                }

                // 2. Filter by Employment Type (Array)
                if (filters.employmentType && filters.employmentType.length > 0) {
                    jobs = jobs.filter(job =>
                        filters.employmentType.includes(job.employmentType)
                    );
                }

                // 3. Filter by Location (Partial Match)
                if (filters.location) {
                    const locTerm = filters.location.toLowerCase();
                    jobs = jobs.filter(job =>
                        job.location.toLowerCase().includes(locTerm)
                    );
                }

                // 4. Filter by Fresher Friendly
                if (filters.fresher === true) {
                    jobs = jobs.filter(job => job.fresher === true);
                }

                // 5. Filter by Salary Range 
                // Assuming job.salary is justl number
                if (filters.minSalary || filters.maxSalary) {
                    jobs = jobs.filter(job => {
                        // Parse mock salary string to average/min value for comparison
                        // This uses a helper or simple regex for mock purposes
                        let jobSalary = 0;
                        if (typeof job.salary === 'string') {
                            const match = job.salary.match(/(\d+)/);
                            if (match) jobSalary = parseInt(match[0], 10);
                        } else if (typeof job.salary === 'number') {
                            jobSalary = job.salary;
                        }

                        if (filters.minSalary && jobSalary < filters.minSalary) return false;
                        if (filters.maxSalary && jobSalary > filters.maxSalary) return false;
                        return true;
                    });
                }

                // 6. Pagination
                const page = filters.page || 1;
                const size = filters.size || 10;
                const total = jobs.length;
                const start = (page - 1) * size;
                const paginatedJobs = jobs.slice(start, start + size);

                return { data: paginatedJobs, total: total };
            } else {
                return httpUtil.get(API_ENDPOINTS.JOBS.SEARCH, filters);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }
    },

    /**
     * Get job details by ID
     * @param {string} id - Job ID
     * @returns {Promise<Object>} Job details
     */
    getJobById: async (id) => {
        try {
            if (USE_MOCK) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const response = await mockApiClient.get(`/jobs/${id}`);
                return response.data;
            } else {
                return httpUtil.get(`${API_ENDPOINTS.JOBS.DETAILS}/${id}`);
            }
        } catch (error) {
            console.error(`Error fetching job ${id}:`, error);
            throw error;
        }
    },

    /**
     * Apply for a job
     * @param {string} jobId - Job ID
     * @param {string} cvUrl - CV URL or ID
     * @returns {Promise<Object>} Application result
     */
    applyToJob: async (jobId, applicationData) => {
        try {
            // Application submission (to be implemented)
            return httpUtil.post(API_ENDPOINTS.JOBS.APPLY, { jobId, ...applicationData });
        } catch (error) {
            console.error('Error applying to job:', error);
            throw error;
        }
    }
};

export default JobSearchService;
