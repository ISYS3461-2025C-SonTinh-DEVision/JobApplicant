/**
 * Form FieldError Component
 * 
 * Displays field validation error message.
 * Only renders when field has error AND has been touched.
 */
import React from 'react';
import { useFormContext } from '../context/FormContext';

export default function FieldError({
    name,
    children,
    className,
    as: Component = 'span',
    showAlways = false,
    ...props
}) {
    const { errors, touched } = useFormContext();

    const error = errors[name];
    const isTouched = touched[name];
    const shouldShow = showAlways ? Boolean(error) : (error && isTouched);

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
