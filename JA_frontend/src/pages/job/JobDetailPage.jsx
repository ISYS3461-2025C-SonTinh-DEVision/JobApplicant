
/**
 * Job Detail Page
 * Displays full details of a specific job posting.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Clock, Building2, Share2, Bookmark } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import JobSearchService from '../../services/JobSearchService';
import { formatDate, formatSalary } from '../../utils/JobHelpers';
import { Tag } from '../../components/reusable';

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const data = await JobSearchService.getJobById(id);
                setJob(data);
            } catch (err) {
                setError('Failed to load job details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJob();
        }
    }, [id]);

    const handleApply = () => {
        console.log('Applying for job:', id);
        // TODO: Implement application flow
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-dark-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className={`min-h-screen p-8 text-center ${isDark ? 'bg-dark-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <h2 className="text-xl font-bold mb-4">Job not found</h2>
                <button
                    onClick={() => navigate('/jobs')}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                >
                    Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
            {/* Header / Nav */}
            <div className={`sticky top-0 z-10 border-b ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDark ? 'text-dark-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="flex items-center gap-3">
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                            <Bookmark className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className={`p-6 rounded-xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {job.title}
                                    </h1>
                                    <div className={`flex items-center gap-2 text-lg ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                        <Building2 className="w-5 h-5" />
                                        {job.company}
                                    </div>
                                </div>
                                {/* Optional: Company Logo */}
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold ${isDark ? 'bg-dark-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {job.company[0]}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-y-4 gap-x-8 pb-6 border-b border-gray-200 dark:border-dark-700">
                                <span className={`flex items-center gap-2 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                </span>
                                <span className={`flex items-center gap-2 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                    <Briefcase className="w-4 h-4" />
                                    {job.employmentType}
                                </span>
                                <span className={`flex items-center gap-2 font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                    <DollarSign className="w-4 h-4" />
                                    {formatSalary(job.salary)}
                                </span>
                                <span className={`flex items-center gap-2 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                    <Clock className="w-4 h-4" />
                                    {formatDate(job.postedAt)}
                                </span>
                            </div>

                            <div className="pt-6">
                                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Job Description
                                </h3>
                                <div className={`prose max-w-none ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                    <p>{job.description}</p>
                                </div>
                            </div>

                            {/* Requirements*/}
                            {job.requirements && (
                                <div className="pt-6">
                                    <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Requirements
                                    </h3>
                                    <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                        {job.requirements.map((req, i) => (
                                            <li key={i}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Actions */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-24 p-6 rounded-xl border space-y-6 ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                            <button
                                onClick={handleApply}
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-lg shadow-lg shadow-primary-500/30 transition-all"
                            >
                                Apply Now
                            </button>

                            <div>
                                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                    Skills Required
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills?.map((skill, index) => (
                                        <Tag
                                            key={index}
                                            label={skill}
                                            variant={isDark ? 'primary' : 'default'}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobDetailPage;
