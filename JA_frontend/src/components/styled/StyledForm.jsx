/**
 * Styled Form Components
 * 
 * Pre-styled versions of headless Form components using Tailwind CSS.
 * These wrap the headless components with the DEVision design system styles.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 * 
 * Usage:
 * import { StyledForm, StyledFormField, StyledFormSubmit } from '../styled/StyledForm';
 * 
 * <StyledForm initialValues={...} onSubmit={...}>
 *   <StyledFormField name="email" label="Email" />
 *   <StyledFormSubmit>Submit</StyledFormSubmit>
 * </StyledForm>
 */
import React from 'react';
import { Form, useFormContext } from '../headless/form';

// =============================================================================
// Styled Form Component
// =============================================================================
export const StyledForm = ({ children, className = "", ...props }) => (
    <Form className={`space-y-6 ${className}`} {...props}>
        {children}
    </Form>
);

// =============================================================================
// Styled Form Field - Complete field with label, input, and error
// =============================================================================
export const StyledFormField = ({
    name,
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    required = false,
    disabled = false,
    className = "",
    inputClassName = "",
    variant = "dark",
    ...props
}) => {
    const { values, errors, touched, handleChange, handleBlur } = useFormContext();

    const hasError = errors[name] && touched[name];

    const baseInputStyles = variant === "dark"
        ? "w-full bg-dark-800/50 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
        : "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all";

    const errorStyles = hasError
        ? "border-red-500/50 focus:ring-red-500/40 focus:border-red-500"
        : "";

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={`block text-sm font-medium ${variant === "dark" ? "text-dark-300" : "text-gray-700"}`}
                >
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Icon className={`w-5 h-5 ${hasError ? 'text-red-400' : 'text-dark-500'}`} />
                    </div>
                )}

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={values[name] || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={`
            ${baseInputStyles}
            ${errorStyles}
            ${Icon ? 'pl-11' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${inputClassName}
          `}
                    aria-invalid={hasError || undefined}
                    aria-describedby={hasError ? `${name}-error` : undefined}
                    {...props}
                />
            </div>

            {hasError && (
                <p
                    id={`${name}-error`}
                    className="text-red-400 text-sm flex items-center gap-1.5"
                    role="alert"
                >
                    {errors[name]}
                </p>
            )}
        </div>
    );
};

// =============================================================================
// Styled Form Field Error - Standalone error display
// =============================================================================
export const StyledFormFieldError = ({ name, className = "" }) => (
    <Form.FieldError
        name={name}
        className={`text-red-400 text-sm mt-1 ${className}`}
    />
);

// =============================================================================
// Styled Form Submit Button
// =============================================================================
export const StyledFormSubmit = ({
    children,
    variant = "primary",
    className = "",
    loadingText = "Loading...",
    ...props
}) => {
    const variants = {
        primary: "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40",
        secondary: "bg-dark-700 text-white hover:bg-dark-600 border border-dark-600",
        danger: "bg-red-600 text-white hover:bg-red-500",
        success: "bg-green-600 text-white hover:bg-green-500",
    };

    return (
        <Form.Submit
            className={`
        w-full h-12 rounded-xl font-semibold text-base
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variants[variant] || variants.primary}
        ${className}
      `}
            {...props}
        >
            {({ isSubmitting }) => (
                isSubmitting ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loadingText}
                    </>
                ) : children
            )}
        </Form.Submit>
    );
};

// =============================================================================
// Styled Form Group
// =============================================================================
export const StyledFormGroup = ({ children, className = "", ...props }) => (
    <Form.Group className={`space-y-4 ${className}`} {...props}>
        {children}
    </Form.Group>
);

// Re-export the base Form for composition
export { Form } from '../headless/form';
