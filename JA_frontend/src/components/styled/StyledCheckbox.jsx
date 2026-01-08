/**
 * Styled Checkbox Component
 * 
 * Pre-styled version of headless Checkbox using DEVision design system.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 * 
 * Usage:
 * <StyledCheckbox
 *   checked={isChecked}
 *   onChange={setChecked}
 *   label="Remember me"
 * />
 */
import React from 'react';
import { Checkbox, useCheckbox } from '../headless/checkbox';
import { Check, Minus } from 'lucide-react';

export const StyledCheckbox = ({
    checked,
    defaultChecked = false,
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
    ...props
}) => {
    // Size variants
    const sizes = {
        sm: {
            box: 'w-4 h-4',
            icon: 'w-2.5 h-2.5',
            text: 'text-sm',
            descText: 'text-xs',
        },
        md: {
            box: 'w-5 h-5',
            icon: 'w-3.5 h-3.5',
            text: 'text-sm',
            descText: 'text-xs',
        },
        lg: {
            box: 'w-6 h-6',
            icon: 'w-4 h-4',
            text: 'text-base',
            descText: 'text-sm',
        },
    };

    const sizeStyles = sizes[size] || sizes.md;

    // Get styles based on variant
    const getBoxStyles = (isChecked) => {
        if (variant === 'dark') {
            if (isChecked) {
                return 'bg-primary-500 border-primary-500';
            }
            return 'bg-dark-700 border-dark-600 hover:border-dark-500';
        } else {
            if (isChecked) {
                return 'bg-primary-500 border-primary-500';
            }
            return 'bg-white border-gray-300 hover:border-gray-400';
        }
    };

    const getLabelStyles = () => {
        if (variant === 'dark') {
            return disabled ? 'text-dark-500' : 'text-dark-300 group-hover:text-white';
        }
        return disabled ? 'text-gray-400' : 'text-gray-700';
    };

    return (
        <Checkbox
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            disabled={disabled}
            indeterminate={indeterminate}
            name={name}
            value={value}
            className={`${className}`}
            {...props}
        >
            {({ isChecked, getCheckboxProps, getLabelProps }) => (
                <label
                    {...getLabelProps()}
                    className={`
                        flex items-start gap-3 cursor-pointer group select-none
                        ${disabled ? 'cursor-not-allowed opacity-60' : ''}
                    `}
                >
                    {/* Custom checkbox box */}
                    <div
                        {...getCheckboxProps()}
                        className={`
                            ${sizeStyles.box}
                            flex items-center justify-center
                            border rounded transition-all duration-200
                            ${getBoxStyles(isChecked)}
                            ${disabled ? '' : 'focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-1'}
                        `}
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

                    {/* Hidden native input for form submission */}
                    <input
                        type="checkbox"
                        name={name}
                        value={value}
                        checked={isChecked}
                        disabled={disabled}
                        onChange={() => { }} // Handled by getCheckboxProps
                        className="sr-only"
                        aria-hidden="true"
                    />
                </label>
            )}
        </Checkbox>
    );
};

// Re-export base components for composition
export { Checkbox, useCheckbox } from '../headless/checkbox';

export default StyledCheckbox;
