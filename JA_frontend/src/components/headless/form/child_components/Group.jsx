/**
 * Form Group Component
 * 
 * Groups related form fields together.
 * Can show group-level errors.
 */
import React from 'react';

export default function Group({
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    return (
        <Component
            className={className}
            role="group"
            {...props}
        >
            {children}
        </Component>
    );
}
