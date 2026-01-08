/**
 * InputField Error Component
 * 
 * Headless error display component.
 * Only renders when there's an error AND field has been touched.
 */
import React from 'react';
import { useInputFieldContext } from '../context/InputFieldContext';

export default function Error({
    children,
    className,
    as: Component = 'span',
    showAlways = false, // If true, shows even if not touched
    ...props
}) {
    const { name, error, touched, hasError } = useInputFieldContext();

    // Don't render if no error, or not touched (unless showAlways)
    const shouldShow = showAlways ? Boolean(error) : hasError;

    if (!shouldShow) {
        return null;
    }

    return (
        <Component
            id={`${name}-error`}
            role="alert"
            className={className}
            {...props}
        >
            {children || error}
        </Component>
    );
}
