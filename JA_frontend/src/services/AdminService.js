/**
 * Admin Service
 * Handles all admin-related API calls using REAL backend data
 * 
 * Architecture: A.2.c - Uses httpUtil for REST requests
 * 
 * Note: Company and Job Post data come from Job Manager subsystem (API Usage Requirements)
 * For now, these will return empty results until Job Manager integration is complete.
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

class AdminService {
    /**
     * Admin login
     */
    async login(credentials) {
        try {
            const response = await httpUtil.post(API_ENDPOINTS.ADMIN?.LOGIN || '/api/admin/login', credentials);
            return response;
        } catch (error) {
            console.warn('Admin login API not available:', error.message);
            throw error;
        }
    }

    /**
     * Admin logout
     */
    async logout() {
        try {
            const response = await httpUtil.post(API_ENDPOINTS.ADMIN?.LOGOUT || '/api/admin/logout');
            return response;
        } catch (error) {
            console.warn('Admin logout API not available:', error.message);
            return { success: true };
        }
    }

    /**
     * Get dashboard statistics from real backend
     */
    async getDashboardStats() {
        try {
            const response = await httpUtil.get('/api/admin/stats');
            return {
                totalApplicants: response.totalApplicants || 0,
                totalCompanies: response.totalCompanies || 0,
                totalJobPosts: response.totalJobPosts || 0,
                activeUsers: response.activeUsers || 0,
                premiumApplicants: response.premiumApplicants || 0,
                premiumCompanies: response.premiumCompanies || 0,
                recentActivity: response.recentActivity || [],
            };
        } catch (error) {
            console.error('Failed to fetch stats from backend:', error.message);
            // Return zeros if API fails
            return {
                totalApplicants: 0,
                totalCompanies: 0,
                totalJobPosts: 0,
                activeUsers: 0,
                premiumApplicants: 0,
                premiumCompanies: 0,
                recentActivity: [],
            };
        }
    }

    /**
     * Get list of applicants with pagination and search
     * Uses REAL backend API
     */
    async getApplicants({ page = 1, limit = 10, search = '' } = {}) {
        try {
            const response = await httpUtil.get('/api/admin/applicants', {
                page,
                limit,
                search,
            });
            return {
                data: response.data || [],
                total: response.total || 0,
                page: response.page || page,
                limit: response.limit || limit,
                totalPages: response.totalPages || 0,
            };
        } catch (error) {
            console.error('Failed to fetch applicants from backend:', error.message);
            return {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
    }

    /**
     * Deactivate an applicant account
     * Uses REAL backend API
     */
    async deactivateApplicant(applicantId) {
        try {
            const response = await httpUtil.put(`/api/admin/applicants/${applicantId}/deactivate`);
            return response;
        } catch (error) {
            console.error('Failed to deactivate applicant:', error.message);
            throw error;
        }
    }

    /**
     * Activate an applicant account (re-enable after deactivation)
     * Uses REAL backend API
     */
    async activateApplicant(applicantId) {
        try {
            const response = await httpUtil.put(`/api/admin/applicants/${applicantId}/activate`);
            return response;
        } catch (error) {
            console.error('Failed to activate applicant:', error.message);
            throw error;
        }
    }

    /**
     * Get list of companies with pagination and search
     * Uses REAL API via JA backend proxy to Job Manager
     * Endpoint: /api/jm/company
     */
    async getCompanies({ page = 1, limit = 10, search = '', country = '', city = '' } = {}) {
        try {
            // Import transformer dynamically to avoid circular deps
            const { transformCompany } = await import('../utils/jobTransformers');

            // Build query params for API call
            const queryParams = {
                page,
                limit,
            };
            if (search) queryParams.search = search;
            if (country) queryParams.country = country;
            if (city) queryParams.city = city;

            // Call JA backend proxy endpoint for Company data
            const response = await httpUtil.get(API_ENDPOINTS.JM_COMPANY.LIST, queryParams);

            // Handle response structure from JA Backend
            // Expected: { companies: [...], totalCount, page, limit, totalPages }
            let companies = [];
            let total = 0;
            let totalPages = 0;

            if (response.companies && Array.isArray(response.companies)) {
                companies = response.companies;
                total = response.totalCount || companies.length;
                totalPages = response.totalPages || Math.ceil(total / limit);
            }
            // Handle { data: [...] } structure
            else if (response.data && Array.isArray(response.data)) {
                companies = response.data;
                total = response.total || companies.length;
                totalPages = response.totalPages || Math.ceil(total / limit);
            }
            // Handle direct array response
            else if (Array.isArray(response)) {
                companies = response;
                total = companies.length;
                totalPages = Math.ceil(total / limit);
            }

            // Transform companies to frontend format
            const transformedCompanies = companies.map(company => {
                const transformed = transformCompany(company);
                return {
                    ...transformed,
                    // Ensure required fields for admin display
                    industry: transformed.industry || 'Technology',
                    jobPostCount: transformed.jobPostCount || 0,
                };
            });

            console.log('[AdminService] Fetched real company data:', transformedCompanies.length);

            return {
                data: transformedCompanies,
                total,
                page,
                limit,
                totalPages,
                isRealData: true,
            };
        } catch (error) {
            console.error('Failed to fetch companies from backend:', error.message);
            // Return empty result on error
            return {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
                isRealData: false,
                error: error.message,
            };
        }
    }

    /**
     * Deactivate a company account
     * Uses JA backend proxy to call Job Manager API
     * Endpoint: POST /api/jm/company/{accountId}/deactivate
     */
    async deactivateCompany(companyId) {
        try {
            const response = await httpUtil.post(API_ENDPOINTS.JM_COMPANY.DEACTIVATE(companyId));
            console.log('[AdminService] Company deactivated:', companyId);
            return {
                success: response.success !== false,
                message: response.message || 'Company deactivated successfully',
                data: response,
            };
        } catch (error) {
            console.error('Failed to deactivate company:', error.message);
            return {
                success: false,
                message: error.message || 'Failed to deactivate company',
            };
        }
    }

    /**
     * Activate a company account
     * Uses JA backend proxy to call Job Manager API
     * Endpoint: POST /api/jm/company/{accountId}/activate
     */
    async activateCompany(companyId) {
        try {
            const response = await httpUtil.post(API_ENDPOINTS.JM_COMPANY.ACTIVATE(companyId));
            console.log('[AdminService] Company activated:', companyId);
            return {
                success: response.success !== false,
                message: response.message || 'Company activated successfully',
                data: response,
            };
        } catch (error) {
            console.error('Failed to activate company:', error.message);
            return {
                success: false,
                message: error.message || 'Failed to activate company',
            };
        }
    }

    /**
     * Get a single company by ID
     * Endpoint: GET /api/jm/company/{id}
     */
    async getCompanyById(companyId) {
        try {
            const { transformCompany } = await import('../utils/jobTransformers');
            const response = await httpUtil.get(API_ENDPOINTS.JM_COMPANY.BY_ID(companyId));

            if (response) {
                return {
                    success: true,
                    data: transformCompany(response),
                };
            }
            return { success: false, data: null };
        } catch (error) {
            console.error('Failed to fetch company:', error.message);
            return { success: false, data: null, error: error.message };
        }
    }

    /**
     * Get list of job posts with pagination and search
     * Uses REAL API via JA backend proxy to Job Manager
     */
    async getJobPosts({ page = 1, limit = 10, search = '' } = {}) {
        try {
            // Import transformer dynamically to avoid circular deps
            const { transformJobPost } = await import('../utils/jobTransformers');

            // Call JA backend proxy endpoint
            const response = await httpUtil.get('/api/job-posts', {
                page,
                size: limit,
                search,
            });

            // Handle JM API response structure
            let jobs = [];
            let total = 0;
            let totalPages = 0;

            // JA Backend returns: { jobs: [...], meta: {...} } or JM structure
            if (response.jobs && Array.isArray(response.jobs)) {
                jobs = response.jobs;
                total = response.meta?.total || jobs.length;
                totalPages = response.meta?.totalPages || Math.ceil(total / limit);
            }
            // JM API structure: directly returns data array
            else if (response.data && Array.isArray(response.data)) {
                jobs = response.data;
                total = response.meta?.total || jobs.length;
                totalPages = response.meta?.totalPages || Math.ceil(total / limit);
            }
            // Handle { data: { data: [...], meta: {...} } } structure
            else if (response.data?.data && Array.isArray(response.data.data)) {
                jobs = response.data.data;
                total = response.data.meta?.total || jobs.length;
                totalPages = response.data.meta?.totalPages || Math.ceil(total / limit);
            }

            // Transform jobs to frontend format
            const transformedJobs = jobs.map(job => {
                const transformed = transformJobPost(job);
                return {
                    ...transformed,
                    // Ensure required fields for admin display
                    company: transformed.company || 'Unknown Company',
                    salary: transformed.salary || 'Negotiable',
                };
            });

            console.log('[AdminService] Fetched real job posts:', transformedJobs.length);

            return {
                data: transformedJobs,
                total,
                page,
                limit,
                totalPages,
                isRealData: true,
            };
        } catch (error) {
            console.error('Failed to fetch job posts from backend:', error.message);
            return {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
                isRealData: false,
            };
        }
    }

    /**
     * Delete a job post (Admin operation)
     * Requirement 6.2.2: Administrators shall be able to delete any Job Post
     * Calls JA backend which proxies to Job Manager API
     */
    async deleteJobPost(jobPostId) {
        try {
            const response = await httpUtil.delete(API_ENDPOINTS.JM_JOB_POSTS.DELETE(jobPostId));
            console.log('[AdminService] Job post deleted:', jobPostId);
            return {
                success: response.success !== false,
                message: response.message || 'Job post deleted successfully',
                data: response,
            };
        } catch (error) {
            console.error('Failed to delete job post:', error.message);
            // Return structured error response instead of throwing
            return {
                success: false,
                message: error.message || 'Failed to delete job post',
                error: error,
            };
        }
    }
}

// Export singleton instance
const adminService = new AdminService();
export default adminService;
