/**
 * Select Headless Component
 * 
 * A compound component pattern for headless select/dropdown.
 * Provides all logic without any styling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * <Select options={options} value={value} onChange={onChange}>
 *   <Select.Trigger className="...">
 *     {({ displayValue }) => <span>{displayValue}</span>}
 *   </Select.Trigger>
 *   <Select.Options className="...">
 *     {({ options }) => options.map(opt => (
 *       <Select.Option key={opt.value} value={opt.value} label={opt.label}>
 *         {({ isSelected }) => <span>{opt.label}</span>}
 *       </Select.Option>
 *     ))}
 *   </Select.Options>
 * </Select>
 */
import React, { useMemo } from 'react';
import { SelectProvider } from './context/SelectContext';
import useSelect from './hooks/useSelect';
import Trigger from './child_components/Trigger';
import Options from './child_components/Options';
import Option from './child_components/Option';

function Select({
    options = [],
    value,
    defaultValue,
    onChange,
    multiple = false,
    searchable = false,
    disabled = false,
    placeholder = 'Select...',
    valueKey = 'value',
    labelKey = 'label',
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    // Use the headless hook for all select logic
    const selectState = useSelect({
        options,
        value,
        defaultValue,
        onChange,
        multiple,
        searchable,
        disabled,
        placeholder,
        valueKey,
        labelKey,
    });

    // Memoize context value
    const contextValue = useMemo(() => selectState, [
        selectState.isOpen,
        selectState.selectedValue,
        selectState.highlightedIndex,
        selectState.searchQuery,
        selectState.filteredOptions,
    ]);

    return (
        <SelectProvider value={contextValue}>
            <Component className={className} {...props}>
                {typeof children === 'function' ? children(selectState) : children}
            </Component>
        </SelectProvider>
    );
}

// Attach child components for compound component pattern
Select.Trigger = Trigger;
Select.Options = Options;
Select.Option = Option;

export default Select;
