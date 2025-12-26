/**
 * Admin Helpers
 * Utility functions for admin panel
 */

/**
 * Format date for display
 */
export function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date with time
 */
export function formatDateTime(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Get relative time (e.g., "5 minutes ago")
 */
export function getRelativeTime(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

    return formatDate(dateString);
}

/**
 * Truncate text
 */
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get status color classes
 */
export function getStatusColor(status) {
    const statusColors = {
        active: 'bg-emerald-500/20 text-emerald-400',
        inactive: 'bg-red-500/20 text-red-400',
        pending: 'bg-yellow-500/20 text-yellow-400',
        expired: 'bg-gray-500/20 text-gray-400',
    };

    return statusColors[status?.toLowerCase()] || statusColors.pending;
}

/**
 * Get badge color for job type
 */
export function getJobTypeColor(type) {
    const typeColors = {
        'Full-time': 'bg-blue-500/20 text-blue-400',
        'Part-time': 'bg-purple-500/20 text-purple-400',
        'Internship': 'bg-pink-500/20 text-pink-400',
        'Contract': 'bg-orange-500/20 text-orange-400',
    };

    return typeColors[type] || 'bg-gray-500/20 text-gray-400';
}

/**
 * Generate initials from name
 */
export function getInitials(name) {
    if (!name) return '?';

    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return 'N/A';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
