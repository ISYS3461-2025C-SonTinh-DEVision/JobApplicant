import React from 'react';
import { Calendar, Building2, MapPin, Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../reusable/Button';
import { formatDate } from '../../utils/date';
import { useTheme } from '../../context/ThemeContext';

export function ApplicationCard({ application, onViewDetails }) {
    const { isDark } = useTheme();

    const getStatusConfig = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted': return { icon: CheckCircle, color: 'green', label: 'Accepted' };
            case 'rejected': return { icon: XCircle, color: 'red', label: 'Rejected' };
            case 'withdrawn': return { icon: XCircle, color: 'gray', label: 'Withdrawn' };
            case 'reviewed': return { icon: Eye, color: 'blue', label: 'Reviewing' };
            default: return { icon: Clock, color: 'amber', label: 'Pending' };
        }
    };

    const status = getStatusConfig(application.status);
    const StatusIcon = status.icon;

    const colorClasses = {
        amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
        blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700',
        green: isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700',
        red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
        gray: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600',
    };

    return (
        <div className={`
      flex flex-col h-full p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg
      ${isDark
                ? 'bg-dark-800 border-dark-700 hover:bg-dark-750'
                : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
            }
    `}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`} title={application.jobTitle}>
                        {application.jobTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Building2 className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                        <span className={`text-sm truncate ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>{application.companyName}</span>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[status.color]}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                </div>
            </div>

            <div className="space-y-3 mb-6 flex-1">
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    <MapPin className="w-4 h-4" />
                    <span>{application.location || 'Remote'}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>Applied: {formatDate(application.appliedDate)}</span>
                </div>
            </div>

            <div className="mt-auto">
                <Button
                    variant={isDark ? "secondary" : "secondary"}
                    fullWidth
                    onClick={() => onViewDetails(application)}
                    className={isDark ? "bg-dark-700 text-white hover:bg-dark-600 border-dark-600" : ""}
                >
                    View Details
                </Button>
            </div>
        </div>
    );
}

export default ApplicationCard;
