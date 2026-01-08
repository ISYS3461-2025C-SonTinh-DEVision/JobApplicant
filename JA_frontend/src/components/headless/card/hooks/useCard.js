/**
 * useCard Hook
 * 
 * Headless hook for card component functionality.
 * Provides common card actions: view, edit, delete, select.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * const card = useCard({
 *   item: jobData,
 *   onView: handleView,
 *   onAction: handleApply,
 *   onDelete: handleDelete
 * });
 */
import { useState, useCallback, useMemo } from 'react';

export default function useCard({
    item = null,
    onView = null,
    onAction = null,
    onDelete = null,
    onSelect = null,
    selected = false,
    idKey = 'id',
}) {
    // Local state for interaction
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get item ID
    const itemId = useMemo(() => item?.[idKey], [item, idKey]);

    // View handler
    const handleView = useCallback(() => {
        if (onView && item) {
            onView(item);
        }
    }, [onView, item]);

    // Primary action handler (e.g., Apply, Save)
    const handleAction = useCallback(async () => {
        if (!onAction || !item) return;

        setIsLoading(true);
        setError(null);

        try {
            await onAction(item);
        } catch (err) {
            setError(err.message || 'Action failed');
        } finally {
            setIsLoading(false);
        }
    }, [onAction, item]);

    // Delete handler
    const handleDelete = useCallback(async () => {
        if (!onDelete || !item) return;

        setIsLoading(true);
        setError(null);

        try {
            await onDelete(item);
        } catch (err) {
            setError(err.message || 'Delete failed');
        } finally {
            setIsLoading(false);
        }
    }, [onDelete, item]);

    // Select handler
    const handleSelect = useCallback(() => {
        if (onSelect && item) {
            onSelect(item, !selected);
        }
    }, [onSelect, item, selected]);

    // Toggle expanded state
    const toggleExpanded = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    // Mouse event handlers
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    // Props getters for card container
    const getCardProps = useCallback((props = {}) => ({
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        'data-hovered': isHovered || undefined,
        'data-selected': selected || undefined,
        'data-loading': isLoading || undefined,
        ...props,
    }), [handleMouseEnter, handleMouseLeave, isHovered, selected, isLoading]);

    // Props getters for view button
    const getViewButtonProps = useCallback((props = {}) => ({
        onClick: handleView,
        disabled: isLoading,
        type: 'button',
        ...props,
    }), [handleView, isLoading]);

    // Props getters for action button
    const getActionButtonProps = useCallback((props = {}) => ({
        onClick: handleAction,
        disabled: isLoading,
        type: 'button',
        'aria-busy': isLoading || undefined,
        ...props,
    }), [handleAction, isLoading]);

    // Props getters for delete button
    const getDeleteButtonProps = useCallback((props = {}) => ({
        onClick: handleDelete,
        disabled: isLoading,
        type: 'button',
        ...props,
    }), [handleDelete, isLoading]);

    // Props getters for select checkbox
    const getSelectProps = useCallback((props = {}) => ({
        checked: selected,
        onChange: handleSelect,
        disabled: isLoading,
        type: 'checkbox',
        ...props,
    }), [selected, handleSelect, isLoading]);

    return {
        // State
        item,
        itemId,
        isHovered,
        isExpanded,
        isLoading,
        selected,
        error,

        // Actions
        handleView,
        handleAction,
        handleDelete,
        handleSelect,
        toggleExpanded,
        setError,

        // Props getters
        getCardProps,
        getViewButtonProps,
        getActionButtonProps,
        getDeleteButtonProps,
        getSelectProps,

        // Convenience flags
        hasViewAction: !!onView,
        hasAction: !!onAction,
        hasDeleteAction: !!onDelete,
        hasSelectAction: !!onSelect,
    };
}
