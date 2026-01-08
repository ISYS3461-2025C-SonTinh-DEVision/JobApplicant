/**
 * Table Header Component
 * 
 * Wraps table header row(s).
 */
import React from 'react';

export default function Header({
    children,
    className,
    as: Component = 'thead',
    ...props
}) {
    return (
        <Component className={className} {...props}>
            {children}
        </Component>
    );
}
