/**
 * Application Service
 * Handles all job application-related API calls
 * 
 * Architecture:
 * - A.2.c: REST HTTP Helper Class (httpUtil) provides base functions
 * - Uses /api/applications/* endpoints for application management
 * - Supports file uploads for CV and Cover Letter (Requirement 4.3.2)
 */

import httpUtil from '../utils/httpUtil';
import { API_ENDPOINTS } from '../config/apiConfig';

class ApplicationService {
    /**
     * Get current user's applications with optional filtering and pagination
     * @param {Object} options - Query options
     * @param {string} [options.status] - Filter by status (PENDING, REVIEWING, ACCEPTED, REJECTED, WITHDRAWN)
     * @param {number} [options.page] - Page number (0-indexed)
     * @param {number} [options.size] - Page size
     * @returns {Promise<Object>} Paginated applications response
     */
    async getMyApplications(options = {}) {
        const params = {};
        if (options.status) params.status = options.status;
        if (options.page !== undefined) params.page = options.page;
        if (options.size !== undefined) params.size = options.size;

        return httpUtil.get(API_ENDPOINTS.APPLICATIONS.MY, params);
    }

    /**
     * Get application history for current user
     * @returns {Promise<Array>} List of applications with timeline
     */
    async getApplicationHistory() {
        return httpUtil.get(API_ENDPOINTS.APPLICATIONS.HISTORY);
    }

    /**
     * Get application by ID
     * @param {string} id - Application ID
     * @returns {Promise<Object>} Application details
     */
    async getApplicationById(id) {
        return httpUtil.get(API_ENDPOINTS.APPLICATIONS.BY_ID(id));
    }

    /**
     * Create a new job application (Requirement 4.3.2 - Upload CV and Cover Letter)
     * @param {Object} applicationData - Application data
     * @param {string} applicationData.jobPostId - Job post ID (required)
     * @param {string} [applicationData.jobTitle] - Job title (optional)
     * @param {string} [applicationData.companyName] - Company name (optional)
     * @param {File} applicationData.cvFile - CV file (required by backend)
     * @param {File} [applicationData.coverLetterFile] - Cover letter file
     * @param {string} [applicationData.coverLetterText] - Cover letter text (optional)
     * @returns {Promise<Object>} Created application
     */
    async createApplication(applicationData) {
        const { jobPostId, jobTitle, companyName, location, employmentType, cvFile, coverLetterFile, coverLetterText } = applicationData;

        const formData = new FormData();
        formData.append('jobPostId', jobPostId);

        if (jobTitle) {
            formData.append('jobTitle', jobTitle);
        }
        if (companyName) {
            formData.append('companyName', companyName);
        }
        if (location) {
            formData.append('location', location);
        }
        if (employmentType) {
            formData.append('employmentType', employmentType);
        }

        if (cvFile) {
            formData.append('cv', cvFile);
        }
        if (coverLetterFile) {
            formData.append('coverLetter', coverLetterFile);
        }
        if (coverLetterText) {
            formData.append('coverLetterText', coverLetterText);
        }
        // Use httpUtil.post directly since we're already constructing the FormData
        // httpUtil.upload would wrap this FormData again, corrupting the request
        return httpUtil.post(API_ENDPOINTS.APPLICATIONS.CREATE, formData);
    }

    /**
     * Withdraw an application
     * @param {string} id - Application ID
     * @returns {Promise<Object>} Updated application
     */
    async withdrawApplication(id) {
        return httpUtil.patch(API_ENDPOINTS.APPLICATIONS.WITHDRAW(id));
    }

    /**
     * Delete an application
     * @param {string} id - Application ID  
     * @returns {Promise<Object>} Deletion result
     */
    async deleteApplication(id) {
        return httpUtil.delete(API_ENDPOINTS.APPLICATIONS.DELETE(id));
    }

    /**
     * Get applications for a specific job post (for company use)
     * @param {string} jobPostId - Job post ID
     * @returns {Promise<Array>} List of applications
     */
    async getApplicationsByJobPost(jobPostId) {
        return httpUtil.get(API_ENDPOINTS.APPLICATIONS.BY_JOB_POST(jobPostId));
    }

    // ==================== Helper Methods ====================

    /**
     * Format application status for display
     * @param {string} status - Raw status from backend
     * @returns {Object} Formatted status with label and color
     */
    formatStatus(status) {
        const statusMap = {
            PENDING: { label: 'Pending', color: 'warning', icon: 'clock' },
            REVIEWING: { label: 'Under Review', color: 'info', icon: 'search' },
            ACCEPTED: { label: 'Accepted', color: 'success', icon: 'check-circle' },
            REJECTED: { label: 'Rejected', color: 'error', icon: 'x-circle' },
            WITHDRAWN: { label: 'Withdrawn', color: 'muted', icon: 'archive' },
        };

        return statusMap[status] || { label: status, color: 'muted', icon: 'help-circle' };
    }

    /**
     * Format date for display
     * @param {string} dateStr - ISO date string
     * @returns {string} Formatted date
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    /**
     * Check if application can be withdrawn
     * @param {Object} application - Application object
     * @returns {boolean} True if can be withdrawn
     */
    canWithdraw(application) {
        return ['PENDING', 'REVIEWING'].includes(application?.status);
    }

    /**
     * Check if reapply is possible
     * @param {Object} application - Application object
     * @returns {boolean} True if can reapply
     */
    canReapply(application) {
        return ['REJECTED', 'WITHDRAWN'].includes(application?.status);
    }
}

// Export singleton instance
const applicationService = new ApplicationService();
export default applicationService;

// Also export the class for testing
export { ApplicationService };
