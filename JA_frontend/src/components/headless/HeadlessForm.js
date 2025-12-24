/**
 * HeadlessForm Hook
 * 
 * Provides form state management without UI rendering.
 * Supports: values, errors, touched states, validation, submission.
 * 
 * Usage:
 * const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useHeadlessForm({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => { ... },
 *   onSubmit: async (values) => { ... }
 * });
 */

import { useState, useCallback, useMemo } from "react";

export default function useHeadlessForm({
  initialValues = {},
  validate,
  onSubmit,
  validateOnBlur = true,
  validateOnChange = false,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [submitError, setSubmitError] = useState(null);

  // Check if form is dirty (values changed from initial)
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Validate single field
  const validateField = useCallback((name, value) => {
    if (!validate) return {};
    const allErrors = validate({ ...values, [name]: value });
    return { [name]: allErrors[name] };
  }, [validate, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validate) return {};
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors;
  }, [validate, values]);

  // Handle field change
  const handleChange = useCallback((nameOrEvent, value) => {
    let fieldName, fieldValue;

    // Support both (name, value) and (event) signatures
    if (typeof nameOrEvent === 'object' && nameOrEvent.target) {
      const { name, value: targetValue, type, checked } = nameOrEvent.target;
      fieldName = name;
      fieldValue = type === 'checkbox' ? checked : targetValue;
    } else {
      fieldName = nameOrEvent;
      fieldValue = value;
    }

    setValues((prev) => ({ ...prev, [fieldName]: fieldValue }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Validate on change if enabled
    if (validateOnChange && validate) {
      const fieldErrors = validateField(fieldName, fieldValue);
      if (fieldErrors[fieldName]) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }

    setSubmitError(null);
  }, [errors, validate, validateOnChange, validateField]);

  // Handle field blur
  const handleBlur = useCallback((nameOrEvent) => {
    let fieldName;

    if (typeof nameOrEvent === 'object' && nameOrEvent.target) {
      fieldName = nameOrEvent.target.name;
    } else {
      fieldName = nameOrEvent;
    }

    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Validate on blur if enabled
    if (validateOnBlur && validate) {
      const fieldErrors = validateField(fieldName, values[fieldName]);
      if (fieldErrors[fieldName]) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }
  }, [validate, validateOnBlur, validateField, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) {
    e.preventDefault();
    }

    setSubmitCount((c) => c + 1);
    setSubmitError(null);

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate
    const validationErrors = validate ? validate(values) : {};
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return { success: false, errors: validationErrors };
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(values);
      return { success: true, data: result };
    } catch (error) {
      setSubmitError(error.message || 'Submission failed');
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  // Set single field value
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set single field error
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Set single field touched
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback((newValues) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [initialValues]);

  // Get field props helper
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
  }), [values, handleChange, handleBlur]);

  // Get field meta helper
  const getFieldMeta = useCallback((name) => ({
    error: errors[name],
    touched: touched[name],
    value: values[name],
  }), [errors, touched, values]);

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    submitCount,
    submitError,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Setters
    setValues,
    setErrors,
    setTouched,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    
    // Utilities
    validateForm,
    validateField,
    resetForm,
    getFieldProps,
    getFieldMeta,
  };
}
