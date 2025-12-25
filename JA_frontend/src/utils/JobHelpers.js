
/**
 * Job Helpers
 * Utility functions for job-related formatting
 */

/**
 * Format salary string or range
 * @param {string|number|Object} salary - Salary data
 * @returns {string} Formatted salary
 */
export const formatSalary = (salary) => {
    if (!salary) return 'Negotiable';
    if (typeof salary === 'string') return salary;
    if (typeof salary === 'number') return `$${salary.toLocaleString()}`;
    if (typeof salary === 'object') {
        const { min, max, currency = 'USD' } = salary;
        if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
        if (min) return `From ${min.toLocaleString()} ${currency}`;
        if (max) return `Up to ${max.toLocaleString()} ${currency}`;
    }
    return 'Negotiable';
};

/**
 * Format date to relative time or standard date
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'New';
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

/**
 * Truncate description text
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export const truncateDescription = (text, length = 100) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};
