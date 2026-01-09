/**
 * Checkbox Headless Component - Minimal Version
 * 
 * Headless checkbox component using render props pattern.
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */
import React from 'react';
import useCheckbox from './hooks/useCheckbox';

function Checkbox({
    checked = false,
    onChange,
    disabled = false,
    indeterminate = false,
    name = '',
    value = '',
    children,
    className,
    ...props
}) {
    const checkboxState = useCheckbox({
        checked,
        onChange,
        disabled,
        indeterminate,
        name,
        value,
    });

    // If children is a function, pass the state to it (render props pattern)
    if (typeof children === 'function') {
        return children(checkboxState);
    }

    // Otherwise just render children
    return <>{children}</>;
}

// Also export the hook for direct usage
Checkbox.useCheckbox = useCheckbox;

export default Checkbox;
