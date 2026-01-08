/**
 * Styled InputField Components
 * 
 * Pre-styled versions of headless InputField components using Tailwind CSS.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 */
import React from 'react';
import { InputField } from '../headless/input_field';

// =============================================================================
// Styled InputField - Complete standalone input with label and error
// =============================================================================
export const StyledInputField = ({
    name,
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    required = false,
    disabled = false,
    validate,
    onChange,
    onBlur,
    initialValue = '',
    className = "",
    variant = "dark",
    ...props
}) => {
    const baseInputStyles = variant === "dark"
        ? "w-full bg-dark-800/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
        : "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all";

    return (
        <InputField
            name={name}
            initialValue={initialValue}
            validate={validate}
            onChange={onChange}
            onBlur={onBlur}
            className={`space-y-2 ${className}`}
        >
            {({ hasError }) => (
                <>
                    {label && (
                        <InputField.Label
                            className={`block text-sm font-medium ${variant === "dark" ? "text-dark-300" : "text-gray-700"}`}
                        >
                            {label}
                            {required && <span className="text-red-400 ml-1">*</span>}
                        </InputField.Label>
                    )}

                    <div className="relative">
                        {Icon && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Icon className={`w-5 h-5 ${hasError ? 'text-red-400' : 'text-dark-500'}`} />
                            </div>
                        )}

                        <InputField.Input
                            type={type}
                            placeholder={placeholder}
                            disabled={disabled}
                            required={required}
                            className={`
                ${baseInputStyles}
                ${hasError ? 'border-red-500/50 focus:ring-red-500/40 focus:border-red-500' : ''}
                ${Icon ? 'pl-11' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                            {...props}
                        />
                    </div>

                    <InputField.Error
                        className="text-red-400 text-sm flex items-center gap-1.5"
                    />
                </>
            )}
        </InputField>
    );
};

// Re-export the base InputField for composition
export { InputField } from '../headless/input_field';
