/**
 * TabList Component
 * 
 * Container for tab buttons.
 */
import React from 'react';
import { useTabsContext } from '../context/TabsContext';

export default function TabList({
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    const { getTabListProps } = useTabsContext();

    return (
        <Component
            className={className}
            {...getTabListProps()}
            {...props}
        >
            {children}
        </Component>
    );
}
