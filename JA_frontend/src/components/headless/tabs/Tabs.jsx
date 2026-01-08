/**
 * Tabs Headless Component
 * 
 * A compound component pattern for headless tabs.
 * Provides tab state management without styling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * <Tabs defaultTab="profile" tabs={['profile', 'settings', 'notifications']}>
 *   <Tabs.TabList>
 *     <Tabs.Tab tabId="profile">Profile</Tabs.Tab>
 *     <Tabs.Tab tabId="settings">Settings</Tabs.Tab>
 *     <Tabs.Tab tabId="notifications">Notifications</Tabs.Tab>
 *   </Tabs.TabList>
 *   <Tabs.TabPanel tabId="profile">Profile content</Tabs.TabPanel>
 *   <Tabs.TabPanel tabId="settings">Settings content</Tabs.TabPanel>
 *   <Tabs.TabPanel tabId="notifications">Notifications content</Tabs.TabPanel>
 * </Tabs>
 */
import React, { useMemo } from 'react';
import { TabsProvider } from './context/TabsContext';
import useTabs from './hooks/useTabs';
import TabList from './child_components/TabList';
import Tab from './child_components/Tab';
import TabPanel from './child_components/TabPanel';

function Tabs({
    defaultTab,
    tabs = [],
    onChange,
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    // Use the headless hook for all tabs logic
    const tabsState = useTabs({
        defaultTab,
        tabs,
        onChange,
    });

    // Memoize context value
    const contextValue = useMemo(() => tabsState, [
        tabsState.activeTab,
    ]);

    return (
        <TabsProvider value={contextValue}>
            <Component className={className} {...props}>
                {typeof children === 'function' ? children(tabsState) : children}
            </Component>
        </TabsProvider>
    );
}

// Attach child components for compound component pattern
Tabs.TabList = TabList;
Tabs.Tab = Tab;
Tabs.TabPanel = TabPanel;

export default Tabs;
