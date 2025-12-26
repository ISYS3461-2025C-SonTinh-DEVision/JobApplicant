/**
 * Admin Validators
 * Validation functions for admin forms
 */

/**
 * Validate search query
 */
export function validateSearchQuery(query) {
    if (!query) return { valid: true, query: '' };

    // Remove dangerous characters
    const sanitized = query
        .replace(/[<>{}[\]\\]/g, '')
        .trim();

    // Check max length
    if (sanitized.length > 100) {
        return {
            valid: false,
            error: 'Search query too long (max 100 characters)',
        };
    }

    return { valid: true, query: sanitized };
}

/**
 * Validate admin email
 */
export function validateAdminEmail(email) {
    const errors = [];

    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
        return errors;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
    }

    return errors;
}

/**
 * Validate admin password
 */
export function validateAdminPassword(password) {
    const errors = [];

    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
        return errors;
    }

    if (password.length < 6) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    return errors;
}

/**
 * Validate pagination params
 */
export function validatePagination(page, limit) {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

    return { page: validPage, limit: validLimit };
}
