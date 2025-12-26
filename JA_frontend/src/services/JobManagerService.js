/**
 * Job Manager Service
 * 
 * Handles communication with the external Job Manager backend API.
 * Implements hybrid approach: Try real API first, fallback to mock data.
 * 
 * API Endpoints from Job Manager:
 * - GET /api/job-posts - Get job posts with filters
 * - GET /api/job-posts/{id} - Get job post by ID
 * - GET /api/companies - Get companies
 * - GET /api/companies/{id} - Get company by ID
 * 
 * Architecture: A.2.c - REST HTTP Helper Class pattern
 */

import { JOB_MANAGER_API_URL, API_ENDPOINTS, AUTH_CONFIG } from '../config/apiConfig';

// Comprehensive mock job posts data matching Job Manager API structure
const MOCK_JOB_POSTS = [
    {
        id: 'job_001',
        uniqueID: 'job_001',
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building user interfaces using React and modern web technologies. Experience with TypeScript, state management, and testing frameworks is a plus.',
        companyId: 'company_001',
        companyName: 'TechCorp Vietnam',
        location: 'Vietnam',
        city: 'Ho Chi Minh City',
        employmentType: 'FULLTIME',
        minSalary: 1500,
        maxSalary: 2500,
        skills: ['React', 'TypeScript', 'Redux', 'TailwindCSS', 'Jest'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-20T10:00:00Z',
        expiresAt: '2025-01-20T23:59:59Z',
        requirements: [
            '3+ years of experience with React',
            'Strong knowledge of JavaScript/TypeScript',
            'Experience with state management (Redux, Zustand)',
            'Familiarity with responsive design',
        ],
    },
    {
        id: 'job_002',
        uniqueID: 'job_002',
        title: 'Backend Developer Intern',
        description: 'Join our backend team as an intern! You will learn to build scalable APIs using Spring Boot and work with databases. Great opportunity for fresh graduates.',
        companyId: 'company_002',
        companyName: 'Cloudify Solutions',
        location: 'Vietnam',
        city: 'Hanoi',
        employmentType: 'INTERNSHIP',
        minSalary: 500,
        maxSalary: 800,
        skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
        isActive: true,
        isFresher: true,
        postedAt: '2024-12-22T14:30:00Z',
        expiresAt: '2025-02-22T23:59:59Z',
        requirements: [
            'Basic knowledge of Java programming',
            'Understanding of REST APIs',
            'Eagerness to learn',
            'Good communication skills',
        ],
    },
    {
        id: 'job_003',
        uniqueID: 'job_003',
        title: 'Full Stack Engineer',
        description: 'Looking for a Full Stack Engineer to work on our SaaS platform. You will work across the entire stack from React frontend to Node.js backend and MongoDB database.',
        companyId: 'company_003',
        companyName: 'InnovateLabs Singapore',
        location: 'Singapore',
        city: 'Singapore',
        employmentType: 'FULLTIME',
        minSalary: 3000,
        maxSalary: 5000,
        skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-18T09:00:00Z',
        expiresAt: '2025-01-31T23:59:59Z',
        requirements: [
            '4+ years of full stack development',
            'Strong React and Node.js skills',
            'Experience with cloud services (AWS/GCP)',
            'Knowledge of CI/CD pipelines',
        ],
    },
    {
        id: 'job_004',
        uniqueID: 'job_004',
        title: 'Data Engineer',
        description: 'Build and maintain data pipelines for our analytics platform. Work with big data technologies including Kafka, Spark, and Snowflake.',
        companyId: 'company_004',
        companyName: 'DataMinds',
        location: 'Singapore',
        city: 'Singapore',
        employmentType: 'CONTRACT',
        minSalary: 4000,
        maxSalary: 6000,
        skills: ['Python', 'Kafka', 'Spark', 'Snowflake', 'AWS'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-15T11:00:00Z',
        expiresAt: '2025-02-15T23:59:59Z',
        requirements: [
            '3+ years of data engineering experience',
            'Proficiency in Python and SQL',
            'Experience with streaming platforms (Kafka)',
            'Knowledge of cloud data warehouses',
        ],
    },
    {
        id: 'job_005',
        uniqueID: 'job_005',
        title: 'UI/UX Designer',
        description: 'Create beautiful and intuitive user interfaces for our mobile and web applications. Work closely with developers to bring designs to life.',
        companyId: 'company_001',
        companyName: 'TechCorp Vietnam',
        location: 'Vietnam',
        city: 'Ho Chi Minh City',
        employmentType: 'FULLTIME',
        minSalary: 1000,
        maxSalary: 1800,
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
        isActive: true,
        isFresher: true,
        postedAt: '2024-12-21T08:00:00Z',
        expiresAt: '2025-01-21T23:59:59Z',
        requirements: [
            'Portfolio demonstrating UI/UX work',
            'Proficiency in Figma or similar tools',
            'Understanding of design systems',
            'Knowledge of accessibility standards',
        ],
    },
    {
        id: 'job_006',
        uniqueID: 'job_006',
        title: 'DevOps Engineer',
        description: 'Manage our cloud infrastructure and CI/CD pipelines. Work with Kubernetes, Docker, and various cloud services to ensure high availability.',
        companyId: 'company_003',
        companyName: 'InnovateLabs Singapore',
        location: 'Singapore',
        city: 'Singapore',
        employmentType: 'FULLTIME',
        minSalary: 3500,
        maxSalary: 5500,
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-19T15:00:00Z',
        expiresAt: '2025-02-01T23:59:59Z',
        requirements: [
            '3+ years of DevOps experience',
            'Strong Kubernetes knowledge',
            'Experience with IaC tools (Terraform)',
            'Understanding of networking and security',
        ],
    },
    {
        id: 'job_007',
        uniqueID: 'job_007',
        title: 'Mobile Developer (React Native)',
        description: 'Build cross-platform mobile applications using React Native. Work on both iOS and Android apps with a single codebase.',
        companyId: 'company_005',
        companyName: 'AppWiz Malaysia',
        location: 'Malaysia',
        city: 'Kuala Lumpur',
        employmentType: 'FULLTIME',
        minSalary: 2000,
        maxSalary: 3500,
        skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Firebase'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-23T10:00:00Z',
        expiresAt: '2025-01-30T23:59:59Z',
        requirements: [
            '2+ years of React Native experience',
            'Published apps on App Store/Play Store',
            'Knowledge of native modules',
            'Experience with push notifications',
        ],
    },
    {
        id: 'job_008',
        uniqueID: 'job_008',
        title: 'Software Engineer Intern',
        description: 'Great opportunity for fresh graduates to learn software development. You will work with React, Spring Boot, and Docker in a supportive environment.',
        companyId: 'company_002',
        companyName: 'Cloudify Solutions',
        location: 'Vietnam',
        city: 'Da Nang',
        employmentType: 'INTERNSHIP',
        minSalary: 400,
        maxSalary: 700,
        skills: ['React', 'Spring Boot', 'Docker', 'Git'],
        isActive: true,
        isFresher: true,
        postedAt: '2024-12-24T09:00:00Z',
        expiresAt: '2025-03-01T23:59:59Z',
        requirements: [
            'Currently enrolled or recently graduated',
            'Basic programming knowledge',
            'Willingness to learn',
            'English communication skills',
        ],
    },
    {
        id: 'job_009',
        uniqueID: 'job_009',
        title: 'QA Automation Engineer',
        description: 'Develop and maintain automated test suites for our web applications. Experience with Selenium, Cypress, or Playwright required.',
        companyId: 'company_006',
        companyName: 'QualityFirst Thailand',
        location: 'Thailand',
        city: 'Bangkok',
        employmentType: 'FULLTIME',
        minSalary: 1800,
        maxSalary: 2800,
        skills: ['Selenium', 'Cypress', 'JavaScript', 'CI/CD', 'TestNG'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-17T12:00:00Z',
        expiresAt: '2025-01-25T23:59:59Z',
        requirements: [
            '2+ years of QA automation experience',
            'Proficiency in test frameworks',
            'Understanding of CI/CD integration',
            'Good analytical skills',
        ],
    },
    {
        id: 'job_010',
        uniqueID: 'job_010',
        title: 'Machine Learning Engineer',
        description: 'Build and deploy ML models for our recommendation system. Work with Python, TensorFlow, and cloud ML services.',
        companyId: 'company_004',
        companyName: 'DataMinds',
        location: 'Singapore',
        city: 'Singapore',
        employmentType: 'FULLTIME',
        minSalary: 4500,
        maxSalary: 7000,
        skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'AWS SageMaker'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-14T08:00:00Z',
        expiresAt: '2025-02-28T23:59:59Z',
        requirements: [
            'MS/PhD in CS, ML, or related field',
            '3+ years of ML engineering',
            'Experience deploying models to production',
            'Knowledge of MLOps practices',
        ],
    },
    {
        id: 'job_011',
        uniqueID: 'job_011',
        title: 'Product Manager',
        description: 'Lead product development for our B2B SaaS platform. Work with engineering, design, and business teams to deliver value.',
        companyId: 'company_003',
        companyName: 'InnovateLabs Singapore',
        location: 'Singapore',
        city: 'Singapore',
        employmentType: 'FULLTIME',
        minSalary: 4000,
        maxSalary: 6500,
        skills: ['Product Management', 'Agile', 'JIRA', 'Data Analysis', 'Roadmapping'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-16T10:00:00Z',
        expiresAt: '2025-01-31T23:59:59Z',
        requirements: [
            '4+ years of product management',
            'Experience with B2B SaaS products',
            'Strong analytical skills',
            'Excellent communication',
        ],
    },
    {
        id: 'job_012',
        uniqueID: 'job_012',
        title: 'Frontend Developer (Vue.js)',
        description: 'Build modern web applications using Vue.js and Nuxt. Work on our customer-facing portal and internal tools.',
        companyId: 'company_005',
        companyName: 'AppWiz Malaysia',
        location: 'Vietnam',
        city: 'Ho Chi Minh City',
        employmentType: 'PARTTIME',
        minSalary: 800,
        maxSalary: 1400,
        skills: ['Vue.js', 'Nuxt.js', 'JavaScript', 'TailwindCSS', 'GraphQL'],
        isActive: true,
        isFresher: true,
        postedAt: '2024-12-25T11:00:00Z',
        expiresAt: '2025-02-25T23:59:59Z',
        requirements: [
            '1+ years of Vue.js experience',
            'Understanding of component-based architecture',
            'Knowledge of state management',
            'Responsive design skills',
        ],
    },
    {
        id: 'job_013',
        uniqueID: 'job_013',
        title: 'System Administrator',
        description: 'Manage and maintain our Linux-based infrastructure. Handle server setup, monitoring, and security.',
        companyId: 'company_006',
        companyName: 'QualityFirst Thailand',
        location: 'Thailand',
        city: 'Bangkok',
        employmentType: 'FULLTIME',
        minSalary: 1500,
        maxSalary: 2500,
        skills: ['Linux', 'Bash', 'Ansible', 'Monitoring', 'Security'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-20T14:00:00Z',
        expiresAt: '2025-02-10T23:59:59Z',
        requirements: [
            '3+ years of Linux administration',
            'Experience with configuration management',
            'Knowledge of network security',
            'Scripting skills (Bash, Python)',
        ],
    },
    {
        id: 'job_014',
        uniqueID: 'job_014',
        title: 'Go Developer',
        description: 'Build high-performance microservices using Go. Work on our distributed systems handling millions of requests.',
        companyId: 'company_004',
        companyName: 'DataMinds',
        location: 'Singapore',
        city: 'Singapore',
        employmentType: 'CONTRACT',
        minSalary: 5000,
        maxSalary: 8000,
        skills: ['Go', 'gRPC', 'Microservices', 'Kubernetes', 'PostgreSQL'],
        isActive: true,
        isFresher: false,
        postedAt: '2024-12-13T09:00:00Z',
        expiresAt: '2025-01-31T23:59:59Z',
        requirements: [
            '4+ years of Go development',
            'Experience with distributed systems',
            'Knowledge of gRPC and protocol buffers',
            'Strong problem-solving skills',
        ],
    },
    {
        id: 'job_015',
        uniqueID: 'job_015',
        title: 'Junior React Developer',
        description: 'Entry-level position for developers passionate about React. You will learn from senior developers while working on real projects.',
        companyId: 'company_001',
        companyName: 'TechCorp Vietnam',
        location: 'Vietnam',
        city: 'Ho Chi Minh City',
        employmentType: 'FULLTIME',
        minSalary: 700,
        maxSalary: 1200,
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
        isActive: true,
        isFresher: true,
        postedAt: '2024-12-26T08:00:00Z',
        expiresAt: '2025-02-28T23:59:59Z',
        requirements: [
            'Less than 1 year of experience',
            'Basic React knowledge',
            'Portfolio or personal projects',
            'Strong desire to learn',
        ],
    },
];

// Mock companies data
const MOCK_COMPANIES = [
    {
        id: 'company_001',
        uniqueID: 'company_001',
        name: 'TechCorp Vietnam',
        description: 'Leading tech company in Vietnam specializing in enterprise software solutions.',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        industry: 'Technology',
        size: '100-500',
        logo: null,
    },
    {
        id: 'company_002',
        uniqueID: 'company_002',
        name: 'Cloudify Solutions',
        description: 'Cloud-native software development company with offices across ASEAN.',
        country: 'Vietnam',
        city: 'Hanoi',
        industry: 'Cloud Services',
        size: '50-100',
        logo: null,
    },
    {
        id: 'company_003',
        uniqueID: 'company_003',
        name: 'InnovateLabs Singapore',
        description: 'Innovation hub for SaaS products targeting enterprise customers.',
        country: 'Singapore',
        city: 'Singapore',
        industry: 'SaaS',
        size: '200-500',
        logo: null,
    },
    {
        id: 'company_004',
        uniqueID: 'company_004',
        name: 'DataMinds',
        description: 'Data analytics and AI company providing insights for businesses.',
        country: 'Singapore',
        city: 'Singapore',
        industry: 'Data Analytics',
        size: '100-200',
        logo: null,
    },
    {
        id: 'company_005',
        uniqueID: 'company_005',
        name: 'AppWiz Malaysia',
        description: 'Mobile-first development company creating innovative apps.',
        country: 'Malaysia',
        city: 'Kuala Lumpur',
        industry: 'Mobile Development',
        size: '50-100',
        logo: null,
    },
    {
        id: 'company_006',
        uniqueID: 'company_006',
        name: 'QualityFirst Thailand',
        description: 'QA and testing services company ensuring software quality.',
        country: 'Thailand',
        city: 'Bangkok',
        industry: 'QA Services',
        size: '50-100',
        logo: null,
    },
];

class JobManagerService {
    constructor() {
        this.baseURL = JOB_MANAGER_API_URL;
        this.useMock = false; // Will be set to true if real API fails
    }

    /**
     * Get auth token for Job Manager API
     * Uses the same token as local backend
     */
    getAuthToken() {
        return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    }

    /**
     * Build headers with authentication
     */
    buildHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        const token = this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    /**
     * Make request to Job Manager API
     * Falls back to mock data on error
     */
    async request(method, endpoint, params = {}) {
        // If we've already determined mock should be used, skip real API
        if (this.useMock) {
            return this.getMockData(endpoint, params);
        }

        try {
            const url = new URL(endpoint, this.baseURL);

            // Add query params for GET requests
            if (method === 'GET' && params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        url.searchParams.append(key, String(value));
                    }
                });
            }

            const config = {
                method,
                headers: this.buildHeaders(),
                credentials: 'omit', // Don't send cookies to external API
            };

            // Add body for non-GET requests
            if (method !== 'GET' && params) {
                config.body = JSON.stringify(params);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            config.signal = controller.signal;

            const response = await fetch(url.toString(), config);
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.warn('Job Manager API auth failed, falling back to mock data');
                    this.useMock = true;
                    return this.getMockData(endpoint, params);
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('Job Manager API error, falling back to mock data:', error.message);
            this.useMock = true;
            return this.getMockData(endpoint, params);
        }
    }

    /**
     * Get mock data based on endpoint
     */
    getMockData(endpoint, params = {}) {
        // Simulate network delay
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint.includes('/api/job-posts')) {
                    // Check if it's a specific job post request
                    const idMatch = endpoint.match(/\/api\/job-posts\/(.+)/);
                    if (idMatch) {
                        const jobId = idMatch[1];
                        const job = MOCK_JOB_POSTS.find(j => j.id === jobId || j.uniqueID === jobId);
                        resolve({
                            statusCode: 200,
                            message: 'Job Post found successfully',
                            data: job || null,
                        });
                    } else {
                        // Return filtered list
                        resolve(this.filterMockJobPosts(params));
                    }
                } else if (endpoint.includes('/api/companies')) {
                    const idMatch = endpoint.match(/\/api\/companies\/(.+)/);
                    if (idMatch) {
                        const companyId = idMatch[1];
                        const company = MOCK_COMPANIES.find(c => c.id === companyId || c.uniqueID === companyId);
                        resolve({
                            statusCode: 200,
                            message: 'Company found successfully',
                            data: company || null,
                        });
                    } else {
                        resolve({
                            statusCode: 200,
                            message: 'Companies retrieved successfully',
                            data: MOCK_COMPANIES,
                        });
                    }
                } else {
                    resolve({ statusCode: 404, message: 'Not found', data: null });
                }
            }, 300);
        });
    }

    /**
     * Filter mock job posts based on params
     */
    filterMockJobPosts(params) {
        let jobs = [...MOCK_JOB_POSTS];

        // Text search across title, description, skills
        if (params.search) {
            const term = params.search.toLowerCase();
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(term) ||
                job.description.toLowerCase().includes(term) ||
                job.skills.some(s => s.toLowerCase().includes(term))
            );
        }

        // Description search for FTS
        if (params.descriptionSearch) {
            const term = params.descriptionSearch.toLowerCase();
            jobs = jobs.filter(job =>
                job.description.toLowerCase().includes(term) ||
                job.skills.some(s => s.toLowerCase().includes(term))
            );
        }

        // Location filter
        if (params.location) {
            const loc = params.location.toLowerCase();
            jobs = jobs.filter(job =>
                job.location.toLowerCase().includes(loc) ||
                job.city.toLowerCase().includes(loc)
            );
        }

        // Employment type filter
        if (params.employmentType) {
            jobs = jobs.filter(job =>
                job.employmentType.toUpperCase() === params.employmentType.toUpperCase()
            );
        }

        // Salary range filter
        if (params.minSalary) {
            jobs = jobs.filter(job => job.maxSalary >= Number(params.minSalary));
        }
        if (params.maxSalary) {
            jobs = jobs.filter(job => job.minSalary <= Number(params.maxSalary));
        }

        // Active filter
        if (params.isActive !== undefined) {
            jobs = jobs.filter(job => job.isActive === (params.isActive === 'true' || params.isActive === true));
        }

        // Fresher filter
        if (params.isFresher === true || params.isFresher === 'true') {
            jobs = jobs.filter(job => job.isFresher === true);
        }

        // Pagination
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;
        const start = (page - 1) * limit;
        const paginatedJobs = jobs.slice(start, start + limit);

        return {
            statusCode: 200,
            message: 'Find Job Post successfully',
            data: {
                data: paginatedJobs,
                meta: {
                    page,
                    limit,
                    total: jobs.length,
                    totalPages: Math.ceil(jobs.length / limit),
                },
            },
        };
    }

    // ==================== Public API Methods ====================

    /**
     * Get job posts with filters
     * @param {Object} filters - Query parameters
     * @returns {Promise<Object>} Job posts with pagination
     */
    async getJobPosts(filters = {}) {
        const response = await this.request('GET', API_ENDPOINTS.JOB_MANAGER.JOB_POSTS, filters);
        return response;
    }

    /**
     * Get job post by ID
     * @param {string} id - Job post ID
     * @returns {Promise<Object>} Job post details
     */
    async getJobPostById(id) {
        const response = await this.request('GET', API_ENDPOINTS.JOB_MANAGER.JOB_POST_BY_ID(id));
        return response;
    }

    /**
     * Get all companies
     * @returns {Promise<Object>} Companies list
     */
    async getCompanies() {
        const response = await this.request('GET', API_ENDPOINTS.JOB_MANAGER.COMPANIES);
        return response;
    }

    /**
     * Get company by ID
     * @param {string} id - Company ID
     * @returns {Promise<Object>} Company details
     */
    async getCompanyById(id) {
        const response = await this.request('GET', API_ENDPOINTS.JOB_MANAGER.COMPANY_BY_ID(id));
        return response;
    }

    /**
     * Transform job post from API/mock format to frontend format
     */
    transformJobPost(job) {
        if (!job) return null;

        return {
            id: job.id || job.uniqueID,
            title: job.title,
            company: job.companyName || job.company,
            companyId: job.companyId,
            location: job.city ? `${job.city}, ${job.location}` : job.location,
            country: job.location,
            city: job.city,
            employmentType: job.employmentType,
            salary: job.minSalary && job.maxSalary
                ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} USD`
                : job.minSalary
                    ? `From ${job.minSalary.toLocaleString()} USD`
                    : null,
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            skills: job.skills || [],
            description: job.description,
            requirements: job.requirements || [],
            fresher: job.isFresher,
            isActive: job.isActive,
            postedAt: job.postedAt,
            expiresAt: job.expiresAt,
        };
    }

    /**
     * Reset mock mode (for testing)
     */
    resetMockMode() {
        this.useMock = false;
    }
}

// Export singleton instance
const jobManagerService = new JobManagerService();
export default jobManagerService;

// Export class and mock data for testing
export { JobManagerService, MOCK_JOB_POSTS, MOCK_COMPANIES };
