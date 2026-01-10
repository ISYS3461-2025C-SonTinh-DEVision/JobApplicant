/**
 * Job Data Transformers
 * Utility functions to transform JM API response to frontend format
 * 
 * Architecture: Centralized data transformation layer
 */

/**
 * Format employment type from API format to display format
 * @param {string} type - Employment type from JM API (e.g., 'FULLTIME')
 * @returns {string} Formatted display string (e.g., 'Full-time')
 */
export function formatEmploymentType(type) {
    if (!type) return 'Unknown';

    const typeMap = {
        'FULLTIME': 'Full-time',
        'FULL_TIME': 'Full-time',
        'Full-time': 'Full-time',
        'PARTTIME': 'Part-time',
        'PART_TIME': 'Part-time',
        'Part-time': 'Part-time',
        'INTERNSHIP': 'Internship',
        'Internship': 'Internship',
        'CONTRACT': 'Contract',
        'Contract': 'Contract',
        'CONTRACTOR': 'Contract',
        'FREELANCE': 'Freelance',
    };

    return typeMap[type] || type;
}

/**
 * Format salary for display
 * @param {Object} job - Job object from JM API
 * @returns {string} Formatted salary string
 */
export function formatSalary(job) {
    // Check salaryType array first (contains formatted string like "USD 900-1100")
    if (job.salaryType && job.salaryType.length > 0) {
        // Filter out non-salary entries like "MONTHLY"
        const salaryStr = job.salaryType.find(s =>
            s.includes('USD') || s.includes('$') || /\d/.test(s)
        );
        if (salaryStr) return salaryStr;
    }

    // Check salaryText
    if (job.salaryText) {
        return job.salaryText;
    }

    // Format from minSalary/maxSalary
    const currency = job.salaryCurrency || 'USD';
    if (job.minSalary && job.maxSalary) {
        return `${currency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`;
    }
    if (job.minSalary) {
        return `From ${currency} ${job.minSalary.toLocaleString()}`;
    }
    if (job.maxSalary) {
        return `Up to ${currency} ${job.maxSalary.toLocaleString()}`;
    }

    return 'Negotiable';
}

/**
 * Format date for display
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateStr) {
    if (!dateStr) return '';

    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return dateStr;
    }
}

/**
 * Transform a single job post from JM API format to frontend format
 * @param {Object} job - Job object from JM API
 * @returns {Object} Transformed job object for frontend
 */
export function transformJobPost(job) {
    if (!job) return null;

    return {
        // ID fields
        id: job.uniqueId || job.id || job._id,
        uniqueId: job.uniqueId || job.id,

        // Basic info
        title: job.title || 'Untitled Position',
        description: job.description || '',

        // Employment type - handle array or string
        type: formatEmploymentType(
            Array.isArray(job.employmentTypes)
                ? job.employmentTypes[0]
                : job.employmentType
        ),
        employmentType: formatEmploymentType(
            Array.isArray(job.employmentTypes)
                ? job.employmentTypes[0]
                : job.employmentType
        ),
        employmentTypes: job.employmentTypes || [job.employmentType],

        // Skills
        skills: job.requiredSkills || job.skills || [],

        // Salary
        salary: formatSalary(job),
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        salaryCurrency: job.salaryCurrency || 'USD',

        // Location
        location: job.location || 'Remote',
        city: job.city || job.location,
        country: job.country || job.location,

        // Company info
        company: job.companyName || job.company || 'Unknown Company',
        companyId: job.companyId,
        companyName: job.companyName || job.company,
        companyLogo: job.logoUrl || job.companyLogo || null,  // Logo URL from JM API

        // Dates
        postedAt: job.postedDate || job.postedAt || job.createdAt,
        expiresAt: job.expiryDate || job.expiresAt,
        postedDate: job.postedDate || job.postedAt,
        expiryDate: job.expiryDate || job.expiresAt,

        // Status
        status: job.isActive !== false ? 'active' : 'expired',
        isActive: job.isActive !== false,

        // Fresher friendly - check all possible field names from JM API
        fresher: job.isFresherFriendly || job.isFresher || job.fresherFriendly || false,
        isFresher: job.isFresherFriendly || job.isFresher || job.fresherFriendly || false,

        // Additional fields
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        applicationCount: job.applicationCount || 0,
    };
}

/**
 * Transform job post list response from JM API
 * @param {Object} response - Response from JM API
 * @returns {Object} Transformed response with {data, total, page, totalPages}
 */
export function transformJobPostListResponse(response) {
    if (!response) {
        return { data: [], total: 0, page: 1, totalPages: 0 };
    }

    // Handle different response structures
    let jobs = [];
    let meta = {};

    // JM API structure: { statusCode, message, data: { data: [...], meta: {...} } }
    if (response.data?.data && Array.isArray(response.data.data)) {
        jobs = response.data.data;
        meta = response.data.meta || {};
    }
    // Direct data array structure: { data: [...], meta: {...} }
    else if (response.data && Array.isArray(response.data)) {
        jobs = response.data;
        meta = response.meta || {};
    }
    // JA Backend proxy structure: { jobs: [...], totalCount, page, totalPages }
    else if (response.jobs && Array.isArray(response.jobs)) {
        jobs = response.jobs;
        // Read pagination info directly from response root (not meta object)
        meta = {
            total: response.totalCount || response.total || jobs.length,
            page: response.page || 1,
            totalPages: response.totalPages || 1,
            limit: response.limit || response.size || 10
        };
    }
    // Simple array response
    else if (Array.isArray(response)) {
        jobs = response;
    }

    const transformedJobs = jobs.map(transformJobPost).filter(Boolean);

    return {
        data: transformedJobs,
        total: meta.total || transformedJobs.length,
        page: meta.page || 1,
        limit: meta.limit || meta.size || 20,
        totalPages: meta.totalPages || Math.ceil((meta.total || transformedJobs.length) / (meta.limit || 20)),
    };
}

/**
 * Check if a URL is valid and not a placeholder
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
function isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;

    // Filter out placeholder/example URLs
    const invalidPatterns = [
        'example.com',
        'placeholder.com',
        'test.com',
        'fake.com',
        'localhost',
        '127.0.0.1',
    ];

    if (invalidPatterns.some(pattern => url.toLowerCase().includes(pattern))) {
        return false;
    }

    // Basic URL structure check
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Transform company from JM API format
 * Maps JM Company API response fields to frontend format
 * 
 * JM API Response fields:
 * - _id, uniqueID, name, country, city, street
 * - phoneNumber, logoUrl, aboutUs
 * - isDeleted, createdAt, updatedAt
 * 
 * @param {Object} company - Company object from JM API
 * @returns {Object} Transformed company object
 */
export function transformCompany(company) {
    if (!company) return null;

    // Validate logo URL
    const rawLogoUrl = company.logoUrl || company.logo || null;
    const validLogoUrl = isValidUrl(rawLogoUrl) ? rawLogoUrl : null;

    return {
        // ID fields - JM uses _id and uniqueID
        id: company._id || company.id || company.uniqueId || company.uniqueID,
        uniqueId: company.uniqueID || company.uniqueId || company._id,

        // Basic info
        name: company.name || company.companyName || 'Unknown Company',
        description: company.aboutUs || company.description || '',
        aboutUs: company.aboutUs || company.description || '',

        // Contact info
        email: company.email || '',
        phoneNumber: company.phoneNumber || '',

        // Location
        country: company.country || company.location || '',
        city: company.city || '',
        street: company.street || '',

        // Branding
        logo: validLogoUrl,
        logoUrl: validLogoUrl,

        // Business info (fallback to reasonable defaults)
        industry: company.industry || 'Technology',
        jobPostCount: company.jobPostCount || company.jobCount || 0,
        planType: company.planType || null,

        // Status
        status: company.isDeleted === true ? 'inactive' : 'active',
        isActive: company.isDeleted !== true,
        isDeleted: company.isDeleted || false,
        isPremium: company.isPremium || company.planType === 'PREMIUM' || false,

        // Timestamps
        createdAt: company.createdAt || null,
        updatedAt: company.updatedAt || null,
    };
}

/**
 * Transform company list response from JM API
 * @param {Object} response - Response from /api/jm/company
 * @returns {Object} Transformed response with {data, total, page, limit, totalPages}
 */
export function transformCompanyListResponse(response) {
    if (!response) {
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    // Handle JA Backend proxy structure: { companies: [...], totalCount, page, limit, totalPages }
    let companies = [];
    let meta = {};

    if (response.companies && Array.isArray(response.companies)) {
        companies = response.companies;
        meta = {
            total: response.totalCount || companies.length,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || Math.ceil((response.totalCount || companies.length) / (response.limit || 10)),
        };
    }
    // Direct array response
    else if (Array.isArray(response)) {
        companies = response;
        meta = { total: companies.length, page: 1, limit: companies.length, totalPages: 1 };
    }
    // Handle { data: [...] } structure
    else if (response.data && Array.isArray(response.data)) {
        companies = response.data;
        meta = {
            total: response.total || companies.length,
            page: response.page || 1,
            limit: response.limit || 10,
            totalPages: response.totalPages || 1,
        };
    }

    const transformedCompanies = companies.map(transformCompany).filter(Boolean);

    return {
        data: transformedCompanies,
        total: meta.total || transformedCompanies.length,
        page: meta.page || 1,
        limit: meta.limit || 10,
        totalPages: meta.totalPages || 1,
    };
}

/**
 * Check if response indicates API is using real data
 * @param {Object} response - API response
 * @returns {boolean} True if using real JM data
 */
export function isRealApiData(response) {
    // Check for JM API response structure
    return !!(
        response?.statusCode === 200 ||
        response?.data?.data ||
        response?.meta?.page !== undefined
    );
}

export default {
    formatEmploymentType,
    formatSalary,
    formatDate,
    transformJobPost,
    transformJobPostListResponse,
    transformCompany,
    transformCompanyListResponse,
    isRealApiData,
};
