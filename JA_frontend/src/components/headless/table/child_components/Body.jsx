/**
 * Table Body Component
 * 
 * Wraps table body rows.
 */
import React from 'react';

export default function Body({
    children,
    className,
    as: Component = 'tbody',
    ...props
}) {
    return (
        <Component className={className} {...props}>
            {children}
        </Component>
    );
}
