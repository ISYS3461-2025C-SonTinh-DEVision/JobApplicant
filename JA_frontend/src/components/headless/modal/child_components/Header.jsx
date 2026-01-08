/**
 * Modal Header Component
 * 
 * Header area for modal title and close button.
 */
import React from 'react';

export default function Header({
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
