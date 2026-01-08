/**
 * InputField Input Component
 * 
 * Headless input component that automatically binds value, onChange, onBlur
 * from context. Supports all standard input props.
 */
import React from 'react';
import { useInputFieldContext } from '../context/InputFieldContext';

export default function Input({
    className,
    as: Component = 'input',
    ...props
}) {
    const {
        name,
        value,
        handleChange,
        handleBlur,
        handleFocus,
        hasError,
        isFocused
    } = useInputFieldContext();

    return (
        <Component
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={className}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${name}-error` : undefined}
            data-error={hasError || undefined}
            data-focused={isFocused || undefined}
            {...props}
        />
    );
}
