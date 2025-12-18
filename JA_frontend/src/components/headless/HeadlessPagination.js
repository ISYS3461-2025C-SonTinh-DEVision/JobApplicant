/**
 * HeadlessPagination Hook
 * 
 * Manages pagination state without UI rendering.
 * Supports: page navigation, page size changes, keyboard navigation.
 * 
 * Usage:
 * const { page, pageSize, totalPages, goToPage, paginatedData } = useHeadlessPagination({
 *   data: items,
 *   pageSize: 10,
 * });
 */

import { useState, useCallback, useMemo } from "react";

export default function useHeadlessPagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
  data = null,
  pageSizeOptions = [10, 25, 50, 100],
} = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate total items from data if provided
  const actualTotalItems = data ? data.length : totalItems;

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(actualTotalItems / pageSize));
  }, [actualTotalItems, pageSize]);

  // Ensure page is within bounds
  const currentPage = useMemo(() => {
    return Math.min(Math.max(1, page), totalPages);
  }, [page, totalPages]);

  // Get paginated data if data array is provided
  const paginatedData = useMemo(() => {
    if (!data) return null;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, currentPage, pageSize]);

  // Navigation functions
  const goToPage = useCallback((pageNumber) => {
    const newPage = Math.min(Math.max(1, pageNumber), totalPages);
    setPage(newPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  // Change page size
  const changePageSize = useCallback((newSize) => {
    setPageSize(newSize);
    // Adjust current page to keep items in view
    const firstItemIndex = (currentPage - 1) * pageSize;
    const newPage = Math.floor(firstItemIndex / newSize) + 1;
    setPage(Math.max(1, newPage));
  }, [currentPage, pageSize]);

  // Check navigation states
  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Calculate item range
  const startItem = actualTotalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, actualTotalItems);

  // Generate page numbers for pagination UI
  const getPageNumbers = useCallback((maxVisible = 5) => {
    const pages = [];
    const halfVisible = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    // Adjust start if end is at max
    if (end === totalPages) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return {
      pages,
      showFirstEllipsis: start > 2,
      showLastEllipsis: end < totalPages - 1,
      showFirstPage: start > 1,
      showLastPage: end < totalPages,
    };
  }, [currentPage, totalPages]);

  // Get pagination props
  const getPaginationProps = useCallback(() => ({
    role: 'navigation',
    'aria-label': 'Pagination',
  }), []);

  // Get page button props
  const getPageButtonProps = useCallback((pageNumber) => ({
    'aria-label': `Go to page ${pageNumber}`,
    'aria-current': pageNumber === currentPage ? 'page' : undefined,
    onClick: () => goToPage(pageNumber),
    disabled: pageNumber === currentPage,
  }), [currentPage, goToPage]);

  // Get navigation button props
  const getNavButtonProps = useCallback((direction) => {
    const props = {
      prev: {
        'aria-label': 'Go to previous page',
        onClick: prevPage,
        disabled: !canGoPrev,
      },
      next: {
        'aria-label': 'Go to next page',
        onClick: nextPage,
        disabled: !canGoNext,
      },
      first: {
        'aria-label': 'Go to first page',
        onClick: firstPage,
        disabled: isFirstPage,
      },
      last: {
        'aria-label': 'Go to last page',
        onClick: lastPage,
        disabled: isLastPage,
      },
    };
    return props[direction] || {};
  }, [canGoPrev, canGoNext, isFirstPage, isLastPage, prevPage, nextPage, firstPage, lastPage]);

  return {
    // State
    page: currentPage,
    pageSize,
    totalPages,
    totalItems: actualTotalItems,
    
    // Navigation
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPage,
    
    // Page size
    changePageSize,
    pageSizeOptions,
    
    // Flags
    canGoNext,
    canGoPrev,
    isFirstPage,
    isLastPage,
    
    // Item info
    startItem,
    endItem,
    
    // Data
    paginatedData,
    
    // Helpers
    getPageNumbers,
    getPaginationProps,
    getPageButtonProps,
    getNavButtonProps,
  };
}
