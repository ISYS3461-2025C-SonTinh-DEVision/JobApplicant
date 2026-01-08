/**
 * useTable Hook
 * 
 * Provides table state management without UI rendering.
 * Supports: sorting, selection, expansion, filtering.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * const { sortKey, direction, toggleSort, sortedData } = useTable({
 *   data: [...],
 *   defaultSortKey: 'name',
 * });
 */
import { useState, useCallback, useMemo } from "react";

export default function useTable({
    data = [],
    defaultSortKey = null,
    defaultDirection = "asc",
    selectable = false,
    expandable = false,
    idField = 'id',
}) {
    const [sortKey, setSortKey] = useState(defaultSortKey);
    const [direction, setDirection] = useState(defaultDirection);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Toggle sort direction or change sort key
    const toggleSort = useCallback((key) => {
        if (key === sortKey) {
            setDirection((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setDirection("asc");
        }
    }, [sortKey]);

    // Sort data based on current sort state
    const sortedData = useMemo(() => {
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];

            // Handle null/undefined
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return direction === "asc" ? 1 : -1;
            if (bVal == null) return direction === "asc" ? -1 : 1;

            // Handle different types
            if (typeof aVal === "number" && typeof bVal === "number") {
                return direction === "asc" ? aVal - bVal : bVal - aVal;
            }

            if (typeof aVal === "string" && typeof bVal === "string") {
                const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
                return direction === "asc" ? comparison : -comparison;
            }

            // Date comparison
            if (aVal instanceof Date && bVal instanceof Date) {
                return direction === "asc" ? aVal - bVal : bVal - aVal;
            }

            // Default string comparison
            const comparison = String(aVal).localeCompare(String(bVal));
            return direction === "asc" ? comparison : -comparison;
        });
    }, [data, sortKey, direction]);

    // Selection handlers
    const selectRow = useCallback((id) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const selectAll = useCallback(() => {
        if (selectedRows.size === data.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(data.map((item) => item[idField])));
        }
    }, [data, selectedRows.size, idField]);

    const clearSelection = useCallback(() => {
        setSelectedRows(new Set());
    }, []);

    const isSelected = useCallback((id) => {
        return selectedRows.has(id);
    }, [selectedRows]);

    const isAllSelected = useMemo(() => {
        return data.length > 0 && selectedRows.size === data.length;
    }, [data.length, selectedRows.size]);

    const isPartiallySelected = useMemo(() => {
        return selectedRows.size > 0 && selectedRows.size < data.length;
    }, [data.length, selectedRows.size]);

    // Expansion handlers
    const toggleExpand = useCallback((id) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        setExpandedRows(new Set(data.map((item) => item[idField])));
    }, [data, idField]);

    const collapseAll = useCallback(() => {
        setExpandedRows(new Set());
    }, []);

    const isExpanded = useCallback((id) => {
        return expandedRows.has(id);
    }, [expandedRows]);

    // Get sort icon helper
    const getSortIcon = useCallback((key) => {
        if (sortKey !== key) return 'none';
        return direction;
    }, [sortKey, direction]);

    // Get header props helper
    const getHeaderProps = useCallback((key, sortable = true) => ({
        onClick: sortable ? () => toggleSort(key) : undefined,
        'aria-sort': sortKey === key ? direction : undefined,
        style: sortable ? { cursor: 'pointer' } : undefined,
        'data-sorted': sortKey === key || undefined,
        'data-direction': sortKey === key ? direction : undefined,
    }), [sortKey, direction, toggleSort]);

    // Get row props helper
    const getRowProps = useCallback((id) => ({
        'aria-selected': selectable ? isSelected(id) : undefined,
        'data-expanded': expandable ? isExpanded(id) : undefined,
        'data-selected': isSelected(id) || undefined,
    }), [selectable, expandable, isSelected, isExpanded]);

    return {
        // Sort state
        sortKey,
        direction,
        toggleSort,
        sortedData,
        getSortIcon,

        // Selection state
        selectedRows: Array.from(selectedRows),
        selectedCount: selectedRows.size,
        selectRow,
        selectAll,
        clearSelection,
        isSelected,
        isAllSelected,
        isPartiallySelected,

        // Expansion state
        expandedRows: Array.from(expandedRows),
        toggleExpand,
        expandAll,
        collapseAll,
        isExpanded,

        // Helpers
        getHeaderProps,
        getRowProps,
    };
}
