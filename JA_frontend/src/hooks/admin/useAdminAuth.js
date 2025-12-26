/**
 * useAdminAuth Hook
 * Convenient hook for admin authentication
 */

import { useAdminAuth as useAdminAuthContext } from '../../context/AdminAuthContext';

export default function useAdminAuth() {
    return useAdminAuthContext();
}
