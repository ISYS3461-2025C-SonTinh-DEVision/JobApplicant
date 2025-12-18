/**
 * Application History Table Component
 * 
 * Displays the user's job application history.
 * Uses HeadlessDataList pattern for shared actions (View, Delete)
 * Uses DataTable for sorting and display.
 * 
 * Architecture: Demonstrates A.3.a - Headless UI pattern
 * Similar template to Job Posts table but customized for applications.
 */

import React from "react";
import { Eye, Trash2, ExternalLink, Clock, CheckCircle, XCircle, Hourglass } from "lucide-react";
import { DataTable, Tag } from "../reusable";

/**
 * Status badge component
 */
function StatusBadge({ status, variant = 'dark' }) {
  const statusConfig = {
    PENDING: {
      icon: Hourglass,
      label: 'Pending',
      color: variant === 'dark' 
        ? 'bg-amber-500/20 text-amber-400' 
        : 'bg-amber-100 text-amber-700',
    },
    REVIEWING: {
      icon: Clock,
      label: 'Reviewing',
      color: variant === 'dark' 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'bg-blue-100 text-blue-700',
    },
    ACCEPTED: {
      icon: CheckCircle,
      label: 'Accepted',
      color: variant === 'dark' 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-green-100 text-green-700',
    },
    REJECTED: {
      icon: XCircle,
      label: 'Rejected',
      color: variant === 'dark' 
        ? 'bg-red-500/20 text-red-400' 
        : 'bg-red-100 text-red-700',
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

/**
 * ApplicationHistoryTable Component
 * 
 * @param {Array} applications - List of applications
 * @param {function} onView - Handler for viewing application details
 * @param {function} onViewJob - Handler for viewing job details
 * @param {function} onWithdraw - Handler for withdrawing application
 * @param {boolean} loading - Loading state
 * @param {string} variant - Theme variant: 'dark' | 'light'
 */
export function ApplicationHistoryTable({
  applications = [],
  onView,
  onViewJob,
  onWithdraw,
  loading = false,
  variant = 'dark',
  className = '',
}) {
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Table columns
  const columns = [
    {
      key: 'jobTitle',
      label: 'Job Title',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className={variant === 'dark' ? 'text-white font-medium' : 'text-gray-900 font-medium'}>
            {value}
          </span>
          <span className={variant === 'dark' ? 'text-dark-400 text-xs' : 'text-gray-500 text-xs'}>
            {row.company}
          </span>
        </div>
      ),
    },
    {
      key: 'appliedAt',
      label: 'Applied Date',
      sortable: true,
      render: (value) => formatDate(value),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} variant={variant} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {onView && (
            <button
              onClick={() => onView(row)}
              className={`p-1.5 rounded-lg transition-colors ${
                variant === 'dark'
                  ? 'hover:bg-dark-700 text-dark-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title="View Application"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onViewJob && (
            <button
              onClick={() => onViewJob(row)}
              className={`p-1.5 rounded-lg transition-colors ${
                variant === 'dark'
                  ? 'hover:bg-dark-700 text-dark-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title="View Job"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          {onWithdraw && row.status === 'PENDING' && (
            <button
              onClick={() => onWithdraw(row)}
              className={`p-1.5 rounded-lg transition-colors ${
                variant === 'dark'
                  ? 'hover:bg-red-500/20 text-dark-400 hover:text-red-400'
                  : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
              }`}
              title="Withdraw Application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={applications}
      defaultSortKey="appliedAt"
      defaultSortDirection="desc"
      variant={variant}
      loading={loading}
      emptyMessage="No applications yet. Start applying to jobs!"
      className={className}
    />
  );
}

/**
 * ApplicationHistoryCard - Card view alternative
 * For mobile responsive display
 */
export function ApplicationHistoryCard({
  application,
  onView,
  onViewJob,
  onWithdraw,
  variant = 'dark',
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const cardTheme = variant === 'dark'
    ? 'bg-dark-800/50 border-dark-700'
    : 'bg-white border-gray-200';

  const textTheme = variant === 'dark'
    ? 'text-white'
    : 'text-gray-900';

  const subTextTheme = variant === 'dark'
    ? 'text-dark-400'
    : 'text-gray-500';

  return (
    <div className={`border rounded-xl p-4 ${cardTheme}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className={`font-medium ${textTheme}`}>{application.jobTitle}</h4>
          <p className={`text-sm ${subTextTheme}`}>{application.company}</p>
        </div>
        <StatusBadge status={application.status} variant={variant} />
      </div>

      <p className={`text-xs ${subTextTheme} mb-3`}>
        Applied on {formatDate(application.appliedAt)}
      </p>

      <div className="flex items-center gap-2 pt-3 border-t border-dark-700/50">
        {onView && (
          <button
            onClick={() => onView(application)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              variant === 'dark'
                ? 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            View Details
          </button>
        )}
        {onViewJob && (
          <button
            onClick={() => onViewJob(application)}
            className={`flex-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              variant === 'dark'
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            View Job
          </button>
        )}
      </div>
    </div>
  );
}

export default ApplicationHistoryTable;

