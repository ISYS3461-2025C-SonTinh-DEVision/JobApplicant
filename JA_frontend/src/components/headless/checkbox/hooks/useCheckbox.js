/**
 * useCheckbox Hook
 * 
 * Headless hook for checkbox functionality.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */
import { useState, useCallback, useRef } from 'react';

export default function useCheckbox({
    checked: controlledChecked,
    defaultChecked = false,
    onChange = null,
    disabled = false,
    indeterminate = false,
    name = '',
    value = '',
}) {
    // State for uncontrolled mode
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    // Ref for the input element
    const inputRef = useRef(null);

    // Controlled vs uncontrolled
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : internalChecked;

    // Toggle handler
    const toggle = useCallback(() => {
        if (disabled) return;

        const newChecked = !isChecked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (onChange) {
            onChange(newChecked, { name, value });
        }
    }, [disabled, isChecked, isControlled, onChange, name, value]);

    // Set checked state directly
    const setChecked = useCallback((newChecked) => {
        if (disabled) return;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (onChange) {
            onChange(newChecked, { name, value });
        }
    }, [disabled, isControlled, onChange, name, value]);

    // Handle change event from input
    const handleChange = useCallback((e) => {
        if (disabled) return;

        const newChecked = e.target.checked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (onChange) {
            onChange(newChecked, { name, value });
        }
    }, [disabled, isControlled, onChange, name, value]);

    // Handle keyboard
    const handleKeyDown = useCallback((e) => {
        if (disabled) return;

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggle();
        }
    }, [disabled, toggle]);

    // Focus the input
    const focus = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Get props for the input element
    const getInputProps = useCallback((props = {}) => ({
        ref: inputRef,
        type: 'checkbox',
        name,
        value,
        checked: isChecked,
        disabled,
        onChange: handleChange,
        'aria-checked': indeterminate ? 'mixed' : isChecked,
        ...props,
    }), [name, value, isChecked, disabled, handleChange, indeterminate]);

    // Get props for a custom checkbox element (div, button, etc.)
    const getCheckboxProps = useCallback((props = {}) => ({
        role: 'checkbox',
        'aria-checked': indeterminate ? 'mixed' : isChecked,
        'aria-disabled': disabled,
        tabIndex: disabled ? -1 : 0,
        onClick: toggle,
        onKeyDown: handleKeyDown,
        'data-checked': isChecked || undefined,
        'data-disabled': disabled || undefined,
        'data-indeterminate': indeterminate || undefined,
        ...props,
    }), [isChecked, disabled, indeterminate, toggle, handleKeyDown]);

    // Get props for the label
    const getLabelProps = useCallback((props = {}) => ({
        htmlFor: name,
        onClick: (e) => {
            // Prevent double toggle if clicking label wrapping input
            if (e.target.tagName !== 'INPUT') {
                toggle();
            }
            if (props.onClick) {
                props.onClick(e);
            }
        },
        ...props,
    }), [name, toggle]);

    return {
        // State
        isChecked,
        indeterminate,
        disabled,
        name,
        value,

        // Actions
        toggle,
        setChecked,
        focus,

        // Props getters
        getInputProps,
        getCheckboxProps,
        getLabelProps,

        // Refs
        inputRef,
    };
}
