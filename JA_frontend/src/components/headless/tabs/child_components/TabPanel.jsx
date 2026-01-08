/**
 * TabPanel Component
 * 
 * Content panel for a tab. Only visible when corresponding tab is active.
 */
import React from 'react';
import { useTabsContext } from '../context/TabsContext';

export default function TabPanel({
    children,
    className,
    tabId,
    as: Component = 'div',
    ...props
}) {
    const { getPanelProps, isActive } = useTabsContext();
    const active = isActive(tabId);

    // Don't render content if not active (for performance)
    if (!active) {
        return null;
    }

    return (
        <Component
            className={className}
            {...getPanelProps(tabId)}
            {...props}
        >
            {typeof children === 'function' ? children({ active }) : children}
        </Component>
    );
}
