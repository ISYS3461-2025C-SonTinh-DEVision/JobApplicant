/**
 * Select Trigger Component
 * 
 * The button/trigger that opens the select dropdown.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */
import React from 'react';
import { useSelectContext } from '../context/SelectContext';

function Trigger({
    children,
    className,
    as: Component = 'button',
    ...props
}) {
    const { getTriggerProps, displayValue, isOpen, disabled } = useSelectContext();

    const triggerProps = getTriggerProps(props);

    return (
        <Component
            type={Component === 'button' ? 'button' : undefined}
            className={className}
            disabled={disabled}
            {...triggerProps}
        >
            {typeof children === 'function'
                ? children({ displayValue, isOpen, disabled })
                : children || displayValue
            }
        </Component>
    );
}

export default Trigger;
