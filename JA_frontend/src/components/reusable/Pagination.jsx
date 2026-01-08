/**
 * Reusable Pagination Component
 * 
 * Styled pagination component that uses HeadlessPagination hook for logic.
 * Supports: dark/light themes, page numbers, navigation buttons, compact mode.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses Headless UI Pattern
 * - Uses useHeadlessPagination hook for pagination logic
 */

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import useHeadlessPagination from "../headless/HeadlessPagination";


/**
 * Pagination Component
 * 
 * @param {number} page - Current page
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Page change handler
 * @param {string} variant - Theme variant: 'dark' | 'light' | 'auto' (uses ThemeContext)
 * @param {string} size - Size variant: 'default' | 'compact'
 * @param {boolean} showFirstLast - Show first/last buttons
 * @param {boolean} showPageNumbers - Show page number buttons
 * @param {number} maxVisiblePages - Max visible page numbers
 * @param {string} className - Additional CSS classes
 */
export function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  variant = 'auto',
  size = 'default',
  showFirstLast = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  showInfo = true,
  totalItems = 0,
  pageSize = 10,
  className = '',
}) {
  // Auto-detect theme from context
  const { isDark } = useTheme();
  const effectiveVariant = variant === 'auto' ? (isDark ? 'dark' : 'light') : variant;

  // Size configurations
  const isCompact = size === 'compact';

  const themes = {
    dark: {
      container: `flex items-center ${isCompact ? 'justify-center gap-2' : 'justify-between gap-4'} text-sm`,
      info: 'text-dark-400',
      nav: `flex items-center ${isCompact ? 'gap-0.5' : 'gap-1'}`,
      button: `
        inline-flex items-center justify-center ${isCompact ? 'w-7 h-7 rounded-md text-xs' : 'w-9 h-9 rounded-lg'}
        text-dark-300 hover:text-white hover:bg-dark-700
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
        transition-colors
      `,
      buttonActive: 'bg-primary-600 text-white hover:bg-primary-700',
      ellipsis: `${isCompact ? 'px-1' : 'px-2'} text-dark-500`,
    },
    light: {
      container: `flex items-center ${isCompact ? 'justify-center gap-2' : 'justify-between gap-4'} text-sm`,
      info: 'text-gray-500',
      nav: `flex items-center ${isCompact ? 'gap-0.5' : 'gap-1'}`,
      button: `
        inline-flex items-center justify-center ${isCompact ? 'w-7 h-7 rounded-md text-xs' : 'w-9 h-9 rounded-lg'}
        text-gray-600 hover:text-gray-900 hover:bg-gray-100
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
        transition-colors
      `,
      buttonActive: 'bg-primary-600 text-white hover:bg-primary-700',
      ellipsis: `${isCompact ? 'px-1' : 'px-2'} text-gray-400`,
    },
  };

  const theme = themes[effectiveVariant] || themes.light;

  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, page - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end === totalPages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    // First page
    if (start > 1) {
      pages.push({ type: 'page', value: 1 });
      if (start > 2) {
        pages.push({ type: 'ellipsis', value: 'start' });
      }
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push({ type: 'page', value: i });
      }
    }

    // Last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push({ type: 'ellipsis', value: 'end' });
      }
      pages.push({ type: 'page', value: totalPages });
    }

    // If start/end already includes first/last, add them
    if (start === 1 && !pages.find(p => p.value === 1)) {
      pages.unshift({ type: 'page', value: 1 });
    }
    if (end === totalPages && !pages.find(p => p.value === totalPages)) {
      pages.push({ type: 'page', value: totalPages });
    }

    return pages;
  };

  // Calculate item range
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className={`${theme.container} ${className}`}>
      {/* Info */}
      {showInfo && totalItems > 0 && (
        <span className={theme.info}>
          Showing {startItem}–{endItem} of {totalItems}
        </span>
      )}

      {/* Navigation */}
      <nav className={theme.nav} aria-label="Pagination">
        {/* First */}
        {showFirstLast && (
          <button
            className={theme.button}
            onClick={() => onPageChange(1)}
            disabled={!canGoPrev}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Prev */}
        <button
          className={theme.button}
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrev}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {showPageNumbers && totalPages > 1 && getPageNumbers().map((item, index) => (
          item.type === 'ellipsis' ? (
            <span key={item.value} className={theme.ellipsis}>...</span>
          ) : (
            <button
              key={item.value}
              className={`${theme.button} ${item.value === page ? theme.buttonActive : ''}`}
              onClick={() => onPageChange(item.value)}
              aria-label={`Go to page ${item.value}`}
              aria-current={item.value === page ? 'page' : undefined}
            >
              {item.value}
            </button>
          )
        ))}

        {/* Next */}
        <button
          className={theme.button}
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
          aria-label="Go to next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last */}
        {showFirstLast && (
          <button
            className={theme.button}
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            aria-label="Go to last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </nav>
    </div>
  );
}

export default Pagination;

