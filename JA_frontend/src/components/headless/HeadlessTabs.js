/**
 * HeadlessTabs Hook
 * 
 * Manages tab navigation state without UI rendering.
 * Supports: controlled/uncontrolled mode, keyboard navigation, ARIA.
 * 
 * Usage:
 * const { activeTab, setActiveTab, getTabProps, getPanelProps } = useHeadlessTabs({
 *   tabs: ['profile', 'settings', 'notifications'],
 *   defaultTab: 'profile',
 * });
 */

import { useState, useCallback, useMemo } from "react";

export default function useHeadlessTabs({
  tabs = [],
  defaultTab = null,
  controlled = false,
  activeTab: controlledActiveTab = null,
  onChange = null,
}) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || (tabs.length > 0 ? tabs[0] : null)
  );

  // Use controlled or internal state
  const activeTab = controlled ? controlledActiveTab : internalActiveTab;

  // Set active tab
  const setActiveTab = useCallback((tab) => {
    if (!tabs.includes(tab)) return;
    
    if (!controlled) {
      setInternalActiveTab(tab);
    }
    
    if (onChange) {
      onChange(tab);
    }
  }, [tabs, controlled, onChange]);

  // Navigate to next tab
  const nextTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  }, [tabs, activeTab, setActiveTab]);

  // Navigate to previous tab
  const prevTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[prevIndex]);
  }, [tabs, activeTab, setActiveTab]);

  // Navigate to first tab
  const firstTab = useCallback(() => {
    if (tabs.length > 0) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, setActiveTab]);

  // Navigate to last tab
  const lastTab = useCallback(() => {
    if (tabs.length > 0) {
      setActiveTab(tabs[tabs.length - 1]);
    }
  }, [tabs, setActiveTab]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextTab();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        prevTab();
        break;
      case 'Home':
        e.preventDefault();
        firstTab();
        break;
      case 'End':
        e.preventDefault();
        lastTab();
        break;
      default:
        break;
    }
  }, [nextTab, prevTab, firstTab, lastTab]);

  // Check if tab is active
  const isActive = useCallback((tab) => {
    return activeTab === tab;
  }, [activeTab]);

  // Get active tab index
  const activeIndex = useMemo(() => {
    return tabs.indexOf(activeTab);
  }, [tabs, activeTab]);

  // Get tab button props
  const getTabProps = useCallback((tab, index) => ({
    id: `tab-${tab}`,
    role: 'tab',
    'aria-selected': isActive(tab),
    'aria-controls': `panel-${tab}`,
    tabIndex: isActive(tab) ? 0 : -1,
    onClick: () => setActiveTab(tab),
    onKeyDown: handleKeyDown,
  }), [isActive, setActiveTab, handleKeyDown]);

  // Get tab panel props
  const getPanelProps = useCallback((tab) => ({
    id: `panel-${tab}`,
    role: 'tabpanel',
    'aria-labelledby': `tab-${tab}`,
    hidden: !isActive(tab),
    tabIndex: 0,
  }), [isActive]);

  // Get tab list props
  const getTabListProps = useCallback(() => ({
    role: 'tablist',
    'aria-orientation': 'horizontal',
  }), []);

  return {
    // State
    activeTab,
    activeIndex,
    tabs,
    
    // Actions
    setActiveTab,
    nextTab,
    prevTab,
    firstTab,
    lastTab,
    
    // Helpers
    isActive,
    getTabProps,
    getPanelProps,
    getTabListProps,
    handleKeyDown,
  };
}

