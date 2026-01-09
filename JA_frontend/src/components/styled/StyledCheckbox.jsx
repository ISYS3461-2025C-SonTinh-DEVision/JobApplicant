/**
 * Styled Checkbox Component - Minimal Version
 * 
 * Pre-styled checkbox using DEVision design system.
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 * 
 * Uses headless Checkbox for logic, adds styling on top.
 */
import React from 'react';
import { Checkbox, useCheckbox } from '../headless/checkbox';
import { Check, Minus } from 'lucide-react';

export const StyledCheckbox = ({
    checked = false,
    onChange,
    disabled = false,
    indeterminate = false,
    label,
    description,
    name = '',
    value = '',
    variant = 'dark',
    size = 'md',
    className = '',
}) => {
    // Size variants
    const sizes = {
        sm: { box: 'w-4 h-4', icon: 'w-2.5 h-2.5', text: 'text-sm', descText: 'text-xs' },
        md: { box: 'w-5 h-5', icon: 'w-3.5 h-3.5', text: 'text-sm', descText: 'text-xs' },
        lg: { box: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-base', descText: 'text-sm' },
    };
    const sizeStyles = sizes[size] || sizes.md;

    // Box styling based on state and variant
    const getBoxStyles = (isChecked) => {
        const base = 'flex items-center justify-center flex-shrink-0 border rounded transition-all duration-200';

        if (variant === 'dark') {
            return isChecked
                ? `${base} bg-primary-500 border-primary-500`
                : `${base} bg-dark-700 border-dark-600 hover:border-dark-500`;
        }
        return isChecked
            ? `${base} bg-primary-500 border-primary-500`
            : `${base} bg-white border-gray-300 hover:border-gray-400`;
    };

    // Label text styling
    const getLabelStyles = () => {
        if (variant === 'dark') {
            return disabled ? 'text-dark-500' : 'text-dark-300';
        }
        return disabled ? 'text-gray-400' : 'text-gray-700';
    };

    return (
        <Checkbox
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            indeterminate={indeterminate}
            name={name}
            value={value}
        >
            {({ isChecked, getContainerProps, getBoxProps, getInputProps }) => (
                <div
                    {...getContainerProps({
                        className: `
                            flex items-start gap-3 select-none
                            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                            ${className}
                        `.trim(),
                    })}
                >
                    {/* Checkbox visual box */}
                    <div
                        {...getBoxProps({
                            className: `${sizeStyles.box} ${getBoxStyles(isChecked)}`,
                        })}
                    >
                        {isChecked && !indeterminate && (
                            <Check className={`${sizeStyles.icon} text-white`} strokeWidth={3} />
                        )}
                        {indeterminate && (
                            <Minus className={`${sizeStyles.icon} text-white`} strokeWidth={3} />
                        )}
                    </div>

                    {/* Label and description */}
                    {(label || description) && (
                        <div className="flex flex-col">
                            {label && (
                                <span className={`${sizeStyles.text} font-medium ${getLabelStyles()} transition-colors`}>
                                    {label}
                                </span>
                            )}
                            {description && (
                                <span className={`${sizeStyles.descText} ${variant === 'dark' ? 'text-dark-500' : 'text-gray-500'}`}>
                                    {description}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Hidden input for form submission */}
                    <input {...getInputProps()} />
                </div>
            )}
        </Checkbox>
    );
};

// Re-export headless components for composition
export { Checkbox, useCheckbox } from '../headless/checkbox';

export default StyledCheckbox;
