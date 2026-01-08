/**
 * Select Option Component
 * 
 * Individual option item in the select dropdown.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */
import React from 'react';
import { useSelectContext } from '../context/SelectContext';

function Option({
    value,
    label,
    children,
    className,
    disabled = false,
    as: Component = 'li',
    ...props
}) {
    const { getOptionProps, filteredOptions, selectedValue, highlightedIndex, multiple } = useSelectContext();

    // Find the index of this option
    const index = filteredOptions.findIndex(opt => opt.value === value);
    const option = { value, label: label || value };

    if (index === -1) {
        return null;
    }

    const optionProps = getOptionProps(option, index, props);

    const isSelected = multiple
        ? (Array.isArray(selectedValue) && selectedValue.includes(value))
        : selectedValue === value;
    const isHighlighted = index === highlightedIndex;

    return (
        <Component
            className={className}
            aria-disabled={disabled}
            {...optionProps}
        >
            {typeof children === 'function'
                ? children({ isSelected, isHighlighted, disabled })
                : children || label || value
            }
        </Component>
    );
}

export default Option;
