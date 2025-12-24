
import { mockApiClient } from './mockApiClient';

// Mock data store
let applications = [
    {
        id: '1',
        jobId: '101',
        jobTitle: 'Senior Frontend Engineer',
        companyName: 'TechCorp Inc.',
        location: 'San Francisco, CA (Remote)',
        status: 'Pending',
        appliedDate: '2025-12-20T10:00:00Z',
        jobDescription: 'We are looking for an experienced Frontend Engineer...',
        resume: 'resume.pdf',
        coverLetter: 'cover_letter.pdf',
        timeline: [
            { status: 'Applied', date: '2025-12-20T10:00:00Z', note: 'Application submitted successfully' }
        ]
    },
    {
        id: '2',
        jobId: '102',
        jobTitle: 'Product Designer',
        companyName: 'Creative Studio',
        location: 'New York, NY',
        status: 'Reviewed',
        appliedDate: '2025-12-18T14:30:00Z',
        jobDescription: 'Creative Studio is seeking a Product Designer...',
        resume: 'resume_v2.pdf',
        timeline: [
            { status: 'Reviewed', date: '2025-12-21T09:00:00Z', note: 'Application under review by hiring manager' },
            { status: 'Applied', date: '2025-12-18T14:30:00Z', note: 'Application submitted successfully' }
        ]
    },
    {
        id: '3',
        jobId: '103',
        jobTitle: 'Full Stack Developer',
        companyName: 'StartupX',
        location: 'Austin, TX',
        status: 'Rejected',
        appliedDate: '2025-12-15T11:00:00Z',
        jobDescription: 'Join our fast-paced startup environment...',
        resume: 'resume.pdf',
        timeline: [
            { status: 'Rejected', date: '2025-12-22T16:00:00Z', note: 'Thank you for your interest. We have decided to move forward with other candidates.' },
            { status: 'Applied', date: '2025-12-15T11:00:00Z', note: 'Application submitted successfully' }
        ]
    },
    {
        id: '4',
        jobId: '104',
        jobTitle: 'Backend Engineer',
        companyName: 'DataSystems',
        location: 'Remote',
        status: 'Accepted',
        appliedDate: '2025-12-10T09:00:00Z',
        jobDescription: 'Heavy backend focus with Go and Python...',
        resume: 'resume_backend.pdf',
        timeline: [
            { status: 'Accepted', date: '2025-12-23T10:00:00Z', note: 'Congratulations! We would like to offer you the position.' },
            { status: 'Interview', date: '2025-12-15T10:00:00Z', note: 'Technical interview scheduled' },
            { status: 'Applied', date: '2025-12-10T09:00:00Z', note: 'Application submitted successfully' }
        ]
    },
    {
        id: '5',
        jobId: '105',
        jobTitle: 'DevOps Engineer',
        companyName: 'CloudNet',
        location: 'Seattle, WA',
        status: 'Withdrawn',
        appliedDate: '2025-12-05T08:00:00Z',
        jobDescription: 'Manage our cloud infrastructure...',
        resume: 'resume_devops.pdf',
        timeline: [
            { status: 'Withdrawn', date: '2025-12-08T12:00:00Z', note: 'Application withdrawn by candidate' },
            { status: 'Applied', date: '2025-12-05T08:00:00Z', note: 'Application submitted successfully' }
        ]
    }
];

export const ApplicationService = {
    getApplications: async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return [...applications];
    },

    getApplicationById: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const app = applications.find(a => a.id === id);
        if (!app) throw new Error('Application not found');
        return { ...app };
    },

    withdrawApplication: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = applications.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Application not found');

        // Update local mock
        const updatedApp = {
            ...applications[index],
            status: 'Withdrawn',
            timeline: [
                { status: 'Withdrawn', date: new Date().toISOString(), note: 'Application withdrawn by candidate' },
                ...applications[index].timeline
            ]
        };
        applications[index] = updatedApp;
        return updatedApp;
    },

    reapply: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = applications.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Application not found');

        // Update local mock
        const updatedApp = {
            ...applications[index],
            status: 'Pending',
            appliedDate: new Date().toISOString(),
            timeline: [
                { status: 'Applied', date: new Date().toISOString(), note: 'Re-applied successfully' },
                ...applications[index].timeline
            ]
        };
        applications[index] = updatedApp;
        return updatedApp;
    }
};
