/**
 * InputField Headless Component
 * 
 * A compound component pattern for headless input field.
 * Provides all logic without any styling - consumers can style as needed.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * <InputField name="email" validate={emailValidator}>
 *   <InputField.Label className="...">Email</InputField.Label>
 *   <InputField.Input className="..." type="email" placeholder="..." />
 *   <InputField.Error className="..." />
 * </InputField>
 */
import React, { useMemo } from 'react';
import { InputFieldProvider } from './context/InputFieldContext';
import useInputField from './hooks/useInputField';
import Label from './child_components/Label';
import Input from './child_components/Input';
import Error from './child_components/Error';

function InputField({
    name,
    initialValue = '',
    validate,
    validateOnBlur = true,
    validateOnChange = false,
    onChange,
    onBlur,
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    // Use the headless hook for all logic
    const fieldState = useInputField({
        name,
        initialValue,
        validate,
        validateOnBlur,
        validateOnChange,
        onChange,
        onBlur,
    });

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => fieldState, [
        fieldState.value,
        fieldState.error,
        fieldState.touched,
        fieldState.isFocused,
        fieldState.hasError,
        // Don't include functions in dependency array - they're stable from useCallback
    ]);

    return (
        <InputFieldProvider value={contextValue}>
            <Component className={className} {...props}>
                {typeof children === 'function' ? children(fieldState) : children}
            </Component>
        </InputFieldProvider>
    );
}

// Attach child components for compound component pattern
InputField.Label = Label;
InputField.Input = Input;
InputField.Error = Error;

export default InputField;
