/**
 * Form Field Component
 * 
 * Wrapper for form fields that provides label, input area, and error display.
 * Uses Form context to access form state.
 */
import React from 'react';
import { useFormContext } from '../context/FormContext';

export default function Field({
    name,
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    const { errors, touched, getFieldProps, getFieldMeta } = useFormContext();

    const fieldProps = getFieldProps(name);
    const fieldMeta = getFieldMeta(name);
    const hasError = Boolean(fieldMeta.error && fieldMeta.touched);

    // If children is a function, pass field state
    if (typeof children === 'function') {
        return (
            <Component
                className={className}
                data-error={hasError || undefined}
                {...props}
            >
                {children({
                    ...fieldProps,
                    error: fieldMeta.error,
                    touched: fieldMeta.touched,
                    hasError,
                })}
            </Component>
        );
    }

    return (
        <Component
            className={className}
            data-error={hasError || undefined}
            {...props}
        >
            {children}
        </Component>
    );
}
