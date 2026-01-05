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
     * Note: JM /api/companies currently returns 404
     * Using mock data until JM team provides company API
     */
    async getCompanies({ page = 1, limit = 10, search = '' } = {}) {
        try {
            // Mock company data (JM /api/companies returns 404)
            const mockCompanies = [
                {
                    id: 'company_001',
                    name: 'TechCorp Vietnam',
                    email: 'hr@techcorp.vn',
                    industry: 'Technology',
                    country: 'Vietnam',
                    city: 'Ho Chi Minh City',
                    jobPostCount: 3,
                    status: 'active',
                    isPremium: true,
                },
                {
                    id: 'company_002',
                    name: 'Cloudify Solutions',
                    email: 'careers@cloudify.io',
                    industry: 'Cloud Services',
                    country: 'Vietnam',
                    city: 'Hanoi',
                    jobPostCount: 2,
                    status: 'active',
                    isPremium: false,
                },
                {
                    id: 'company_003',
                    name: 'InnovateLabs Singapore',
                    email: 'jobs@innovatelabs.sg',
                    industry: 'SaaS',
                    country: 'Singapore',
                    city: 'Singapore',
                    jobPostCount: 4,
                    status: 'active',
                    isPremium: true,
                },
                {
                    id: 'company_004',
                    name: 'DataMinds',
                    email: 'hr@dataminds.io',
                    industry: 'Data Analytics',
                    country: 'Singapore',
                    city: 'Singapore',
                    jobPostCount: 2,
                    status: 'active',
                    isPremium: false,
                },
            ];

            // Filter by search
            let filtered = mockCompanies;
            if (search) {
                const term = search.toLowerCase();
                filtered = mockCompanies.filter(c =>
                    c.name.toLowerCase().includes(term) ||
                    c.industry.toLowerCase().includes(term)
                );
            }

            // Paginate
            const start = (page - 1) * limit;
            const paginated = filtered.slice(start, start + limit);

            console.log('[AdminService] Using mock company data (JM API returns 404)');

            return {
                data: paginated,
                total: filtered.length,
                page,
                limit,
                totalPages: Math.ceil(filtered.length / limit),
                isMockData: true,
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
