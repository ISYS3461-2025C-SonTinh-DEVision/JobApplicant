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
     * Get list of companies with pagination and search
     * Note: Companies are managed by Job Manager subsystem
     * This will call Job Manager API when integration is complete
     */
    async getCompanies({ page = 1, limit = 10, search = '' } = {}) {
        try {
            // TODO: Call Job Manager API for company data
            // const response = await httpUtil.get('JOB_MANAGER_URL/api/companies', { page, limit, search });
            console.warn('Company data should come from Job Manager subsystem');
            return {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        } catch (error) {
            console.error('Failed to fetch companies:', error.message);
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
     * Deactivate a company account
     * Note: Companies are managed by Job Manager subsystem
     */
    async deactivateCompany(companyId) {
        try {
            // TODO: Call Job Manager API
            console.warn('Company deactivation should go through Job Manager subsystem');
            return { success: false, message: 'Company management requires Job Manager integration' };
        } catch (error) {
            console.error('Failed to deactivate company:', error.message);
            throw error;
        }
    }

    /**
     * Get list of job posts with pagination and search
     * Note: Job Posts are managed by Job Manager subsystem
     * This will call Job Manager API when integration is complete
     */
    async getJobPosts({ page = 1, limit = 10, search = '' } = {}) {
        try {
            // TODO: Call Job Manager API for job post data
            // const response = await httpUtil.get('JOB_MANAGER_URL/api/job-posts', { page, limit, search });
            console.warn('Job post data should come from Job Manager subsystem');
            return {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        } catch (error) {
            console.error('Failed to fetch job posts:', error.message);
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
     * Delete a job post
     * Note: Job Posts are managed by Job Manager subsystem
     */
    async deleteJobPost(jobPostId) {
        try {
            // TODO: Call Job Manager API
            console.warn('Job post deletion should go through Job Manager subsystem');
            return { success: false, message: 'Job post management requires Job Manager integration' };
        } catch (error) {
            console.error('Failed to delete job post:', error.message);
            throw error;
        }
    }
}

// Export singleton instance
const adminService = new AdminService();
export default adminService;
