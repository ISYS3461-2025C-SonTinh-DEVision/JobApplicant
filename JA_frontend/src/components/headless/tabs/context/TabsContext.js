/**
 * Tabs Context
 * 
 * Provides shared tabs state for all Tabs child components.
 */
import { createContext, useContext } from 'react';

const TabsContext = createContext(null);

export const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs provider');
    }
    return context;
};

export const TabsProvider = TabsContext.Provider;

export default TabsContext;
