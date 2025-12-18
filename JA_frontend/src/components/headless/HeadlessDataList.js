/**
 * HeadlessDataList Hook
 * 
 * Generic data list management for items that share similar templates/actions.
 * As per requirement A.3.a: Job Post List and Application List can share the same
 * data template with customizable actions (View, Delete, etc.)
 * 
 * Usage:
 * const {
 *   items,
 *   loading,
 *   error,
 *   handleView,
 *   handleDelete,
 *   handleAction,
 * } = useHeadlessDataList({
 *   fetchFn: () => api.getJobPosts(),
 *   onView: (item) => navigate(`/jobs/${item.id}`),
 *   onDelete: (item) => api.deleteJob(item.id),
 * });
 */

import { useState, useCallback, useEffect, useMemo } from "react";

export default function useHeadlessDataList({
  // Data fetching
  initialData = [],
  fetchFn = null,
  fetchOnMount = true,
  
  // Actions callbacks
  onView = null,
  onEdit = null,
  onDelete = null,
  onSelect = null,
  
  // Item identifier
  idKey = 'id',
  
  // Filtering/Search
  searchKeys = [],
  
  // Confirmation
  confirmDelete = true,
}) {
  const [items, setItems] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!fetchFn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setItems(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  // Fetch on mount if enabled
  useEffect(() => {
    if (fetchOnMount && fetchFn) {
      fetchData();
    }
  }, [fetchOnMount, fetchFn, fetchData]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) {
      return items;
    }

    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [items, searchQuery, searchKeys]);

  // View action
  const handleView = useCallback(async (item) => {
    setSelectedItem(item);
    if (onView) {
      setActionInProgress('view');
      try {
        await onView(item);
      } finally {
        setActionInProgress(null);
      }
    }
  }, [onView]);

  // Edit action
  const handleEdit = useCallback(async (item) => {
    setSelectedItem(item);
    if (onEdit) {
      setActionInProgress('edit');
      try {
        await onEdit(item);
      } finally {
        setActionInProgress(null);
      }
    }
  }, [onEdit]);

  // Delete action with optional confirmation
  const handleDelete = useCallback(async (item) => {
    if (confirmDelete) {
      setDeleteConfirmItem(item);
      return;
    }

    if (onDelete) {
      setActionInProgress('delete');
      try {
        await onDelete(item);
        // Remove from local state
        setItems((prev) => prev.filter((i) => i[idKey] !== item[idKey]));
      } finally {
        setActionInProgress(null);
      }
    }
  }, [confirmDelete, onDelete, idKey]);

  // Confirm delete
  const confirmDeleteAction = useCallback(async () => {
    if (!deleteConfirmItem || !onDelete) return;

    setActionInProgress('delete');
    try {
      await onDelete(deleteConfirmItem);
      setItems((prev) => prev.filter((i) => i[idKey] !== deleteConfirmItem[idKey]));
      setDeleteConfirmItem(null);
    } finally {
      setActionInProgress(null);
    }
  }, [deleteConfirmItem, onDelete, idKey]);

  // Cancel delete
  const cancelDelete = useCallback(() => {
    setDeleteConfirmItem(null);
  }, []);

  // Select action
  const handleSelect = useCallback(async (item) => {
    setSelectedItem(item);
    if (onSelect) {
      await onSelect(item);
    }
  }, [onSelect]);

  // Generic action handler
  const handleAction = useCallback(async (actionName, item, actionFn) => {
    setActionInProgress(actionName);
    try {
      await actionFn(item);
    } finally {
      setActionInProgress(null);
    }
  }, []);

  // Add item to list
  const addItem = useCallback((item) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  // Update item in list
  const updateItem = useCallback((itemId, updates) => {
    setItems((prev) =>
      prev.map((item) =>
        item[idKey] === itemId ? { ...item, ...updates } : item
      )
    );
  }, [idKey]);

  // Remove item from list
  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((item) => item[idKey] !== itemId));
  }, [idKey]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Get item actions helper (for rendering action buttons)
  const getItemActions = useCallback((item) => {
    const actions = [];
    
    if (onView) {
      actions.push({
        key: 'view',
        label: 'View',
        onClick: () => handleView(item),
        disabled: actionInProgress === 'view',
      });
    }
    
    if (onEdit) {
      actions.push({
        key: 'edit',
        label: 'Edit',
        onClick: () => handleEdit(item),
        disabled: actionInProgress === 'edit',
      });
    }
    
    if (onDelete) {
      actions.push({
        key: 'delete',
        label: 'Delete',
        onClick: () => handleDelete(item),
        disabled: actionInProgress === 'delete',
        variant: 'danger',
      });
    }
    
    return actions;
  }, [onView, onEdit, onDelete, handleView, handleEdit, handleDelete, actionInProgress]);

  return {
    // Data
    items: filteredItems,
    allItems: items,
    loading,
    error,
    
    // Selection
    selectedItem,
    handleSelect,
    clearSelection,
    
    // Actions
    handleView,
    handleEdit,
    handleDelete,
    handleAction,
    actionInProgress,
    
    // Delete confirmation
    deleteConfirmItem,
    confirmDeleteAction,
    cancelDelete,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // CRUD
    fetchData,
    addItem,
    updateItem,
    removeItem,
    setItems,
    
    // Helpers
    getItemActions,
    isEmpty: filteredItems.length === 0,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
}

