/**
 * Table Cell Component
 * 
 * Standard table cell.
 */
import React from 'react';

export default function Cell({
    children,
    className,
    as: Component = 'td',
    ...props
}) {
    return (
        <Component className={className} {...props}>
            {children}
        </Component>
    );
}
