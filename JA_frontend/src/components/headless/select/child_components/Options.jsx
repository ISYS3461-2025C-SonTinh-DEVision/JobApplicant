/**
 * Select Options Container Component
 * 
 * Container for the dropdown options.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */
import React from 'react';
import { useSelectContext } from '../context/SelectContext';

function Options({
    children,
    className,
    as: Component = 'ul',
    ...props
}) {
    const { getOptionsProps, isOpen, filteredOptions } = useSelectContext();

    if (!isOpen) {
        return null;
    }

    const optionsProps = getOptionsProps(props);

    return (
        <Component className={className} {...optionsProps}>
            {typeof children === 'function'
                ? children({ options: filteredOptions })
                : children
            }
        </Component>
    );
}

export default Options;
