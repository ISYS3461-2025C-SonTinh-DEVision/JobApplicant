/**
 * useInputField Hook
 * 
 * Provides headless input field logic for state management and validation.
 * This hook is used internally by InputField component or can be used standalone.
 * 
 * Usage:
 * const { value, error, touched, handleChange, handleBlur } = useInputField({
 *   name: 'email',
 *   initialValue: '',
 *   validate: (val) => !val ? 'Required' : null
 * });
 */
import { useState, useCallback } from 'react';

export default function useInputField({
    name,
    initialValue = '',
    validate,
    validateOnBlur = true,
    validateOnChange = false,
    onChange: externalOnChange,
    onBlur: externalOnBlur,
}) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState(null);
    const [touched, setTouched] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Validate the field value
    const validateField = useCallback((val) => {
        if (!validate) return null;
        const validationError = validate(val);
        return validationError;
    }, [validate]);

    // Handle value change
    const handleChange = useCallback((eventOrValue) => {
        let newValue;

        // Support both event and direct value
        if (eventOrValue && eventOrValue.target) {
            const { type, checked, value: targetValue } = eventOrValue.target;
            newValue = type === 'checkbox' ? checked : targetValue;
        } else {
            newValue = eventOrValue;
        }

        setValue(newValue);

        // Clear error when user types
        if (error) {
            setError(null);
        }

        // Validate on change if enabled
        if (validateOnChange) {
            const validationError = validateField(newValue);
            if (validationError) {
                setError(validationError);
            }
        }

        // Call external onChange if provided
        if (externalOnChange) {
            externalOnChange(name, newValue);
        }
    }, [name, error, validateOnChange, validateField, externalOnChange]);

    // Handle blur
    const handleBlur = useCallback((event) => {
        setTouched(true);
        setIsFocused(false);

        // Validate on blur if enabled
        if (validateOnBlur) {
            const validationError = validateField(value);
            setError(validationError);
        }

        // Call external onBlur if provided
        if (externalOnBlur) {
            externalOnBlur(name);
        }
    }, [name, value, validateOnBlur, validateField, externalOnBlur]);

    // Handle focus
    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    // Set value programmatically
    const setFieldValue = useCallback((newValue) => {
        setValue(newValue);
        setError(null);
    }, []);

    // Set error programmatically
    const setFieldError = useCallback((errorMessage) => {
        setError(errorMessage);
    }, []);

    // Reset field
    const resetField = useCallback(() => {
        setValue(initialValue);
        setError(null);
        setTouched(false);
        setIsFocused(false);
    }, [initialValue]);

    // Get input props for spreading onto input element
    const getInputProps = useCallback(() => ({
        name,
        value,
        onChange: handleChange,
        onBlur: handleBlur,
        onFocus: handleFocus,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': error ? `${name}-error` : undefined,
    }), [name, value, error, handleChange, handleBlur, handleFocus]);

    return {
        // State
        name,
        value,
        error,
        touched,
        isFocused,
        hasError: Boolean(error && touched),

        // Handlers
        handleChange,
        handleBlur,
        handleFocus,

        // Setters
        setValue: setFieldValue,
        setError: setFieldError,
        resetField,

        // Helpers
        getInputProps,
        validateField,
    };
}
