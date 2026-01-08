/**
 * Tab Component
 * 
 * Individual tab button.
 */
import React from 'react';
import { useTabsContext } from '../context/TabsContext';

export default function Tab({
    children,
    className,
    tabId,
    as: Component = 'button',
    ...props
}) {
    const { getTabProps, isActive } = useTabsContext();
    const active = isActive(tabId);

    return (
        <Component
            className={className}
            type={Component === 'button' ? 'button' : undefined}
            {...getTabProps(tabId)}
            {...props}
        >
            {typeof children === 'function' ? children({ active }) : children}
        </Component>
    );
}
