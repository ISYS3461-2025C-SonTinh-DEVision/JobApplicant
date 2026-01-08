/**
 * useSelect Hook
 * 
 * Headless hook for select/dropdown functionality.
 * Provides all logic without any styling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export default function useSelect({
    options = [],
    value = null,
    defaultValue = null,
    onChange = null,
    multiple = false,
    searchable = false,
    disabled = false,
    placeholder = 'Select...',
    valueKey = 'value',
    labelKey = 'label',
}) {
    // Normalize options to { value, label } format
    const normalizedOptions = useMemo(() => {
        return options.map(opt => {
            if (typeof opt === 'string') {
                return { value: opt, label: opt };
            }
            return {
                value: opt[valueKey],
                label: opt[labelKey] || opt[valueKey],
                ...opt,
            };
        });
    }, [options, valueKey, labelKey]);

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value ?? defaultValue);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchQuery, setSearchQuery] = useState('');

    // Refs
    const triggerRef = useRef(null);
    const optionsRef = useRef(null);
    const searchInputRef = useRef(null);

    // Controlled vs uncontrolled
    const isControlled = value !== undefined && value !== null;
    const currentValue = isControlled ? value : selectedValue;

    // Get selected option(s)
    const selectedOption = useMemo(() => {
        if (multiple) {
            const values = Array.isArray(currentValue) ? currentValue : [];
            return normalizedOptions.filter(opt => values.includes(opt.value));
        }
        return normalizedOptions.find(opt => opt.value === currentValue) || null;
    }, [currentValue, normalizedOptions, multiple]);

    // Filter options by search query
    const filteredOptions = useMemo(() => {
        if (!searchable || !searchQuery.trim()) {
            return normalizedOptions;
        }
        const query = searchQuery.toLowerCase();
        return normalizedOptions.filter(opt =>
            String(opt.label).toLowerCase().includes(query)
        );
    }, [normalizedOptions, searchQuery, searchable]);

    // Display value for trigger
    const displayValue = useMemo(() => {
        if (multiple && Array.isArray(selectedOption) && selectedOption.length > 0) {
            return selectedOption.map(opt => opt.label).join(', ');
        }
        if (!multiple && selectedOption) {
            return selectedOption.label;
        }
        return placeholder;
    }, [selectedOption, multiple, placeholder]);

    // Open/close handlers
    const open = useCallback(() => {
        if (disabled) return;
        setIsOpen(true);
        setHighlightedIndex(0);
        if (searchable) {
            setSearchQuery('');
        }
    }, [disabled, searchable]);

    const close = useCallback(() => {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchQuery('');
    }, []);

    const toggle = useCallback(() => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }, [isOpen, open, close]);

    // Selection handler
    const selectOption = useCallback((option) => {
        if (disabled) return;

        let newValue;

        if (multiple) {
            const currentValues = Array.isArray(currentValue) ? currentValue : [];
            if (currentValues.includes(option.value)) {
                newValue = currentValues.filter(v => v !== option.value);
            } else {
                newValue = [...currentValues, option.value];
            }
        } else {
            newValue = option.value;
            close();
        }

        if (!isControlled) {
            setSelectedValue(newValue);
        }

        if (onChange) {
            onChange(newValue, option);
        }
    }, [disabled, multiple, currentValue, isControlled, onChange, close]);

    // Clear selection
    const clearSelection = useCallback(() => {
        const newValue = multiple ? [] : null;
        if (!isControlled) {
            setSelectedValue(newValue);
        }
        if (onChange) {
            onChange(newValue, null);
        }
    }, [multiple, isControlled, onChange]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (disabled) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    selectOption(filteredOptions[highlightedIndex]);
                } else if (!isOpen) {
                    open();
                }
                break;
            case 'Escape':
                e.preventDefault();
                close();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    open();
                } else {
                    setHighlightedIndex(prev =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                    );
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (isOpen) {
                    setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                }
                break;
            case 'Home':
                if (isOpen) {
                    e.preventDefault();
                    setHighlightedIndex(0);
                }
                break;
            case 'End':
                if (isOpen) {
                    e.preventDefault();
                    setHighlightedIndex(filteredOptions.length - 1);
                }
                break;
            default:
                break;
        }
    }, [disabled, isOpen, highlightedIndex, filteredOptions, selectOption, open, close]);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                optionsRef.current &&
                !optionsRef.current.contains(e.target)
            ) {
                close();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, close]);

    // Focus search input when open
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    // Get props for trigger element
    const getTriggerProps = useCallback((props = {}) => ({
        ref: triggerRef,
        onClick: toggle,
        onKeyDown: handleKeyDown,
        'aria-haspopup': 'listbox',
        'aria-expanded': isOpen,
        'aria-disabled': disabled,
        tabIndex: disabled ? -1 : 0,
        role: 'combobox',
        ...props,
    }), [toggle, handleKeyDown, isOpen, disabled]);

    // Get props for options container
    const getOptionsProps = useCallback((props = {}) => ({
        ref: optionsRef,
        role: 'listbox',
        'aria-multiselectable': multiple,
        ...props,
    }), [multiple]);

    // Get props for individual option
    const getOptionProps = useCallback((option, index, props = {}) => {
        const isSelected = multiple
            ? (Array.isArray(currentValue) && currentValue.includes(option.value))
            : currentValue === option.value;
        const isHighlighted = index === highlightedIndex;

        return {
            role: 'option',
            'aria-selected': isSelected,
            onClick: () => selectOption(option),
            onMouseEnter: () => setHighlightedIndex(index),
            'data-highlighted': isHighlighted || undefined,
            'data-selected': isSelected || undefined,
            tabIndex: -1,
            ...props,
        };
    }, [multiple, currentValue, highlightedIndex, selectOption]);

    // Get props for search input
    const getSearchInputProps = useCallback((props = {}) => ({
        ref: searchInputRef,
        value: searchQuery,
        onChange: (e) => setSearchQuery(e.target.value),
        placeholder: 'Search...',
        type: 'text',
        ...props,
    }), [searchQuery]);

    return {
        // State
        isOpen,
        selectedValue: currentValue,
        selectedOption,
        highlightedIndex,
        searchQuery,
        displayValue,

        // Options
        options: normalizedOptions,
        filteredOptions,

        // Actions
        open,
        close,
        toggle,
        selectOption,
        clearSelection,
        setSearchQuery,
        setHighlightedIndex,

        // Props getters
        getTriggerProps,
        getOptionsProps,
        getOptionProps,
        getSearchInputProps,

        // Refs
        triggerRef,
        optionsRef,
        searchInputRef,

        // Flags
        hasValue: multiple 
            ? (Array.isArray(currentValue) && currentValue.length > 0)
            : currentValue !== null && currentValue !== undefined,
        disabled,
        multiple,
        searchable,
    };
}
