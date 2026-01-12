
/**
 * JobList Component
 * Renders a grid/list of JobCards
 */
import React from 'react';
import JobCard, { JobCardSkeleton } from './JobCard';
import CatLoadingSpinner from '../common/CatLoadingSpinner';

const JobList = ({ jobs, loading, onView, onApply, onSave, variant = 'dark' }) => {
    if (loading) {
        return (
            <div className="space-y-6">
                {/* Cat animation for better visual feedback */}
                <div className="flex items-center justify-center py-4">
                    <CatLoadingSpinner size="lg" message="Finding jobs for you..." />
                </div>
                {/* Skeleton cards to show structure */}
                <div className="space-y-4 opacity-50">
                    {[...Array(3)].map((_, i) => (
                        <JobCardSkeleton key={i} variant={variant} />
                    ))}
                </div>
            </div>
        );
    }

    if (!jobs || jobs.length === 0) {
        return (
            <div className={`
                text-center py-12 rounded-xl border
                ${variant === 'dark'
                    ? 'bg-dark-800 border-dark-700'
                    : 'bg-white border-gray-200'
                }
            `}>
                <h3 className={`text-xl font-medium mb-2 ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    No jobs found
                </h3>
                <p className={`${variant === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
                    Try adjusting your search or filters to find what you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {jobs.map((job) => (
                <JobCard
                    key={job.id}
                    job={job}
                    onView={onView}
                    onApply={onApply}
                    onSave={onSave}
                    variant={variant}
                />
            ))}
        </div>
    );
};

export default JobList;
