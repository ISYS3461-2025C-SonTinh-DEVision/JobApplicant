/**
 * useCheckbox Hook - Minimal Working Version
 * 
 * Headless hook for controlled checkbox functionality.
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Design: Purely controlled component - no internal state.
 * Parent must provide `checked` and `onChange` props.
 */
import { useCallback, useId } from 'react';

export default function useCheckbox({
    checked = false,
    onChange,
    disabled = false,
    indeterminate = false,
    name = '',
    value = '',
}) {
    // Generate unique ID for accessibility
    const generatedId = useId();
    const checkboxId = name || generatedId;

    // Toggle handler - simply calls onChange with opposite value
    const handleToggle = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (disabled) return;

        // Call parent's onChange with the NEW state (opposite of current)
        if (onChange) {
            onChange(!checked);
        }
    }, [disabled, checked, onChange]);

    // Keyboard handler
    const handleKeyDown = useCallback((e) => {
        if (disabled) return;

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handleToggle();
        }
    }, [disabled, handleToggle]);

    // Props for the clickable container
    const getContainerProps = useCallback((userProps = {}) => ({
        role: 'checkbox',
        'aria-checked': indeterminate ? 'mixed' : checked,
        'aria-disabled': disabled || undefined,
        tabIndex: disabled ? -1 : 0,
        onClick: handleToggle,
        onKeyDown: handleKeyDown,
        style: { cursor: disabled ? 'not-allowed' : 'pointer' },
        ...userProps,
    }), [checked, disabled, indeterminate, handleToggle, handleKeyDown]);

    // Props for the visual checkbox box (no click handler - parent handles)
    const getBoxProps = useCallback((userProps = {}) => ({
        'aria-hidden': true,
        'data-checked': checked || undefined,
        'data-disabled': disabled || undefined,
        ...userProps,
    }), [checked, disabled]);

    // Props for hidden input
    const getInputProps = useCallback((userProps = {}) => ({
        type: 'checkbox',
        id: checkboxId,
        name,
        value,
        checked,
        disabled,
        readOnly: true,
        tabIndex: -1,
        className: 'sr-only',
        'aria-hidden': true,
        ...userProps,
    }), [checkboxId, name, value, checked, disabled]);

    return {
        // State (read from props, not internal)
        isChecked: checked,
        isDisabled: disabled,
        isIndeterminate: indeterminate,

        // Actions
        toggle: handleToggle,

        // Props getters
        getContainerProps,
        getBoxProps,
        getInputProps,

        // For compatibility
        getRootProps: getContainerProps,
        getIndicatorProps: getBoxProps,
    };
}
