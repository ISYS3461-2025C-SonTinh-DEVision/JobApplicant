
/**
 * useJobPagination Hook
 * Manages pagination state for job lists
 */
import { useState, useCallback } from 'react';

export const useJobPagination = (initialPage = 1, initialSize = 10) => {
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const [hasMore, setHasMore] = useState(true);

    const resetPagination = useCallback(() => {
        setPage(1);
        setHasMore(true);
    }, []);

    const loadMore = useCallback(() => {
        if (hasMore) {
            setPage(prev => prev + 1);
        }
    }, [hasMore]);

    const updateHasMore = useCallback((totalItems, currentItemsCount) => {
        setHasMore(currentItemsCount < totalItems);
    }, []);

    return {
        page,
        size,
        hasMore,
        setPage,
        setSize,
        loadMore,
        resetPagination,
        updateHasMore
    };
};

export default useJobPagination;
