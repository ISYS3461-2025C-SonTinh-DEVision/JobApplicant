/**
 * Checkbox Headless Component
 * 
 * A headless checkbox component with full accessibility support.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * <Checkbox checked={checked} onChange={setChecked}>
 *   {({ isChecked, getCheckboxProps }) => (
 *     <div {...getCheckboxProps()} className={isChecked ? 'checked' : ''}>
 *       {isChecked && <Check />}
 *     </div>
 *   )}
 * </Checkbox>
 */
import React, { useMemo } from 'react';
import useCheckbox from './hooks/useCheckbox';

function Checkbox({
    checked,
    defaultChecked = false,
    onChange,
    disabled = false,
    indeterminate = false,
    name = '',
    value = '',
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    const checkboxState = useCheckbox({
        checked,
        defaultChecked,
        onChange,
        disabled,
        indeterminate,
        name,
        value,
    });

    // Memoize to prevent unnecessary re-renders
    const contextValue = useMemo(() => checkboxState, [
        checkboxState.isChecked,
        checkboxState.disabled,
        checkboxState.indeterminate,
    ]);

    return (
        <Component className={className} {...props}>
            {typeof children === 'function' ? children(contextValue) : children}
        </Component>
    );
}

// Also export the hook for direct usage
Checkbox.useCheckbox = useCheckbox;

export default Checkbox;
