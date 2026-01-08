/**
 * InputField Label Component
 * 
 * Headless label component that renders with proper accessibility attributes.
 * Uses context to get field name for htmlFor attribute.
 */
import React from 'react';
import { useInputFieldContext } from '../context/InputFieldContext';

export default function Label({ children, className, as: Component = 'label', ...props }) {
    const { name, hasError } = useInputFieldContext();

    return (
        <Component
            htmlFor={Component === 'label' ? name : undefined}
            className={className}
            data-error={hasError || undefined}
            {...props}
        >
            {children}
        </Component>
    );
}
