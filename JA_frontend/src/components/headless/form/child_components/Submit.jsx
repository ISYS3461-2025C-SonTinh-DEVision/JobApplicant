/**
 * Form Submit Component
 * 
 * Submit button that automatically accesses form submission state.
 * Disabled while form is submitting.
 */
import React from 'react';
import { useFormContext } from '../context/FormContext';

export default function Submit({
    children,
    className,
    as: Component = 'button',
    disableWhileSubmitting = true,
    ...props
}) {
    const { isSubmitting, isValid, isDirty } = useFormContext();

    const isDisabled = (disableWhileSubmitting && isSubmitting) || props.disabled;

    return (
        <Component
            type="submit"
            className={className}
            disabled={isDisabled}
            data-submitting={isSubmitting || undefined}
            data-valid={isValid || undefined}
            data-dirty={isDirty || undefined}
            {...props}
        >
            {typeof children === 'function'
                ? children({ isSubmitting, isValid, isDirty })
                : children
            }
        </Component>
    );
}
