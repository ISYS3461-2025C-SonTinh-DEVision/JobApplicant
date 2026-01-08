/**
 * useTabs Hook
 * 
 * Provides tabs state management without UI rendering.
 * Supports: tab switching, keyboard navigation.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * const { activeTab, setActiveTab, getTabProps, getPanelProps } = useTabs({
 *   defaultTab: 'tab1',
 *   tabs: ['tab1', 'tab2', 'tab3']
 * });
 */
import { useState, useCallback, useMemo } from "react";

export default function useTabs({
    defaultTab,
    tabs = [],
    onChange,
} = {}) {
    const [activeTab, setActiveTabState] = useState(defaultTab || tabs[0]);

    // Set active tab
    const setActiveTab = useCallback((tabId) => {
        setActiveTabState(tabId);
        if (onChange) {
            onChange(tabId);
        }
    }, [onChange]);

    // Go to next tab
    const nextTab = useCallback(() => {
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveTab(tabs[nextIndex]);
    }, [activeTab, tabs, setActiveTab]);

    // Go to previous tab
    const prevTab = useCallback(() => {
        const currentIndex = tabs.indexOf(activeTab);
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        setActiveTab(tabs[prevIndex]);
    }, [activeTab, tabs, setActiveTab]);

    // Check if tab is active
    const isActive = useCallback((tabId) => {
        return activeTab === tabId;
    }, [activeTab]);

    // Get tab button props
    const getTabProps = useCallback((tabId) => ({
        id: `tab-${tabId}`,
        role: 'tab',
        'aria-selected': activeTab === tabId,
        'aria-controls': `panel-${tabId}`,
        tabIndex: activeTab === tabId ? 0 : -1,
        onClick: () => setActiveTab(tabId),
        onKeyDown: (e) => {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextTab();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevTab();
            }
        },
        'data-active': activeTab === tabId || undefined,
    }), [activeTab, setActiveTab, nextTab, prevTab]);

    // Get tab panel props
    const getPanelProps = useCallback((tabId) => ({
        id: `panel-${tabId}`,
        role: 'tabpanel',
        'aria-labelledby': `tab-${tabId}`,
        hidden: activeTab !== tabId,
        tabIndex: 0,
        'data-active': activeTab === tabId || undefined,
    }), [activeTab]);

    // Get tab list props
    const getTabListProps = useCallback(() => ({
        role: 'tablist',
    }), []);

    return {
        // State
        activeTab,
        tabs,

        // Actions
        setActiveTab,
        nextTab,
        prevTab,
        isActive,

        // Props helpers
        getTabProps,
        getPanelProps,
        getTabListProps,
    };
}
