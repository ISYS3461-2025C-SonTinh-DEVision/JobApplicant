/**
 * Modal Body Component
 * 
 * Body area for modal main content.
 */
import React from 'react';

export default function Body({
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    return (
        <Component className={className} {...props}>
            {children}
        </Component>
    );
}
