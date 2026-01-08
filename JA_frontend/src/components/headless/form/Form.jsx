/**
 * Form Headless Component
 * 
 * A compound component pattern for headless forms.
 * Provides form state management without any styling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * <Form
 *   initialValues={{ email: '', password: '' }}
 *   validate={validateFn}
 *   onSubmit={handleSubmit}
 * >
 *   <Form.Field name="email">
 *     {({ value, onChange, error }) => (
 *       <>
 *         <input value={value} onChange={onChange} />
 *         <Form.FieldError name="email" />
 *       </>
 *     )}
 *   </Form.Field>
 *   <Form.Submit>Submit</Form.Submit>
 * </Form>
 */
import React, { useMemo } from 'react';
import { FormProvider } from './context/FormContext';
import useForm from './hooks/useForm';
import Field from './child_components/Field';
import FieldError from './child_components/FieldError';
import Submit from './child_components/Submit';
import Group from './child_components/Group';

function Form({
    initialValues = {},
    validate,
    onSubmit,
    validateOnBlur = true,
    validateOnChange = false,
    children,
    className,
    ...props
}) {
    // Use the headless hook for all form logic
    const formState = useForm({
        initialValues,
        validate,
        onSubmit,
        validateOnBlur,
        validateOnChange,
    });

    // Memoize context value
    const contextValue = useMemo(() => formState, [
        formState.values,
        formState.errors,
        formState.touched,
        formState.isSubmitting,
        formState.isDirty,
        formState.isValid,
        formState.submitError,
    ]);

    return (
        <FormProvider value={contextValue}>
            <form
                onSubmit={formState.handleSubmit}
                className={className}
                noValidate
                {...props}
            >
                {typeof children === 'function' ? children(formState) : children}
            </form>
        </FormProvider>
    );
}

// Attach child components for compound component pattern
Form.Field = Field;
Form.FieldError = FieldError;
Form.Submit = Submit;
Form.Group = Group;

export default Form;
