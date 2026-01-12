import React from 'react';
import { ApplicationCard } from './ApplicationCard';
import { FileText } from 'lucide-react';
import { Button } from '../reusable/Button';
import { useTheme } from '../../context/ThemeContext';
import CatLoadingSpinner from '../common/CatLoadingSpinner';

export function ApplicationList({
    applications = [],
    loading = false,
    error = null,
    onViewDetails,
    onRetry
}) {
    const { isDark } = useTheme();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <CatLoadingSpinner size="lg" message="Loading applications..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className={`
          p-4 rounded-lg inline-block max-w-md mb-4
          ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700'}
        `}>
                    <p className="font-medium">Error loading applications</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
                <div>
                    <Button onClick={onRetry} variant="secondary">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!applications || applications.length === 0) {
        return (
            <div className={`
        flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl
        ${isDark
                    ? 'border-dark-700 bg-dark-800/50'
                    : 'border-gray-200 bg-gray-50/50'
                }
      `}>
                <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mb-4
          ${isDark ? 'bg-dark-700' : 'bg-gray-100'}
        `}>
                    <FileText className={`w-8 h-8 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    No applications yet
                </h3>
                <p className={`max-w-sm mx-auto mb-6 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    You haven't applied to any jobs yet. Start searching for your dream job!
                </p>
                <Button onClick={() => window.location.href = '/dashboard/jobs'}>
                    Browse Jobs
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => (
                <div key={app.id} className="h-full">
                    <ApplicationCard
                        application={app}
                        onViewDetails={onViewDetails}
                    />
                </div>
            ))}
        </div>
    );
}

export default ApplicationList;
