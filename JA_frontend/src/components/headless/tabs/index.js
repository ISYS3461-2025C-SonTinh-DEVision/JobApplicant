/**
 * Tabs Headless Component - Public Exports
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

// Main component
export { default as Tabs } from './Tabs';
export { default } from './Tabs';

// Hook for standalone usage
export { default as useTabs } from './hooks/useTabs';

// Context for advanced usage
export {
    useTabsContext,
    TabsProvider
} from './context/TabsContext';

// Child components for custom composition
export { default as TabList } from './child_components/TabList';
export { default as Tab } from './child_components/Tab';
export { default as TabPanel } from './child_components/TabPanel';
