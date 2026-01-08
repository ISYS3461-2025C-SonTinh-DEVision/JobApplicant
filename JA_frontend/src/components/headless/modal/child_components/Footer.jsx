/**
 * Modal Footer Component
 * 
 * Footer area for modal action buttons.
 */
import React from 'react';

export default function Footer({
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
