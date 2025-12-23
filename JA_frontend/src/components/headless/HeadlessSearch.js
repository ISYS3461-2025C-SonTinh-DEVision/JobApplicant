/**
 * HeadlessSearch Hook
 * 
 * Manages search and filter state without UI rendering.
 * Supports: text search, multiple filters, debouncing, search history.
 * 
 * Usage:
 * const { query, filters, setQuery, updateFilter, filteredData } = useHeadlessSearch({
 *   data: items,
 *   searchKeys: ['title', 'description'],
 *   initialFilters: { category: '', status: '' },
 * });
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";

export default function useHeadlessSearch({
  initialQuery = '',
  initialFilters = {},
  data = null,
  searchKeys = [],
  debounceMs = 300,
  caseSensitive = false,
  maxHistory = 10,
} = {}) {
  const [query, setQueryState] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState(initialFilters);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef(null);

  // Debounce search query
  useEffect(() => {
    setIsSearching(true);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs]);

  // Set query with optional immediate mode (skip debounce)
  const setQuery = useCallback((newQuery, immediate = false) => {
    setQueryState(newQuery);
    if (immediate) {
      setDebouncedQuery(newQuery);
      setIsSearching(false);
    }
  }, []);

  // Update single filter
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Update multiple filters
  const updateFilters = useCallback((updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset filters to initial state
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Reset all (query + filters)
  const resetAll = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setFilters(initialFilters);
  }, [initialFilters]);

  // Clear query only
  const clearQuery = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
  }, []);

  // Add to search history
  const addToHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== searchTerm);
      return [searchTerm, ...filtered].slice(0, maxHistory);
    });
  }, [maxHistory]);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      const initial = initialFilters[key];
      return value !== initial && value !== '' && value !== null && value !== undefined;
    });
  }, [filters, initialFilters]);

  // Check if search is active
  const hasActiveSearch = debouncedQuery.trim().length > 0;

  // Filter data based on query and filters
  const filteredData = useMemo(() => {
    if (!data) return null;

    let result = [...data];

    // Apply text search
    if (debouncedQuery.trim() && searchKeys.length > 0) {
      const searchTerm = caseSensitive 
        ? debouncedQuery.trim() 
        : debouncedQuery.trim().toLowerCase();

      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          if (value == null) return false;
          const strValue = caseSensitive 
            ? String(value) 
            : String(value).toLowerCase();
          return strValue.includes(searchTerm);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue === '' || filterValue === null || filterValue === undefined) {
        return;
      }

      if (Array.isArray(filterValue) && filterValue.length === 0) {
        return;
      }

      result = result.filter((item) => {
        const itemValue = item[key];
        
        // Array filter (multiple selection)
        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue);
        }
        
        // Range filter { min, max }
        if (typeof filterValue === 'object' && ('min' in filterValue || 'max' in filterValue)) {
          const numValue = Number(itemValue);
          if (filterValue.min !== undefined && numValue < filterValue.min) return false;
          if (filterValue.max !== undefined && numValue > filterValue.max) return false;
          return true;
        }
        
        // Exact match
        return itemValue === filterValue;
      });
    });

    return result;
  }, [data, debouncedQuery, filters, searchKeys, caseSensitive]);

  // Get search input props
  const getSearchInputProps = useCallback(() => ({
    type: 'search',
    value: query,
    onChange: (e) => setQuery(e.target.value),
    onKeyDown: (e) => {
      if (e.key === 'Enter') {
        addToHistory(query);
      }
      if (e.key === 'Escape') {
        clearQuery();
      }
    },
    'aria-label': 'Search',
    placeholder: 'Search...',
  }), [query, setQuery, addToHistory, clearQuery]);

  // Get filter select props
  const getFilterSelectProps = useCallback((filterKey) => ({
    value: filters[filterKey] || '',
    onChange: (e) => updateFilter(filterKey, e.target.value),
    name: filterKey,
  }), [filters, updateFilter]);

  // Get clear button props
  const getClearButtonProps = useCallback(() => ({
    onClick: resetAll,
    disabled: !hasActiveSearch && !hasActiveFilters,
    'aria-label': 'Clear search and filters',
  }), [resetAll, hasActiveSearch, hasActiveFilters]);

  return {
    // Query state
    query,
    debouncedQuery,
    setQuery,
    clearQuery,
    isSearching,
    
    // Filter state
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters,
    
    // Combined
    resetAll,
    hasActiveSearch,
    
    // History
    searchHistory,
    addToHistory,
    clearHistory,
    
    // Data
    filteredData,
    resultCount: filteredData?.length || 0,
    
    // Helpers
    getSearchInputProps,
    getFilterSelectProps,
    getClearButtonProps,
  };
}
