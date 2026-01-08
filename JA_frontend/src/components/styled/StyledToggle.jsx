/**
 * Styled Toggle/Switch Component
 * 
 * Pre-styled toggle switch using headless checkbox logic.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 * 
 * Usage:
 * <StyledToggle
 *   checked={isEnabled}
 *   onChange={setEnabled}
 *   label="Enable notifications"
 * />
 */
import React from 'react';
import { useCheckbox } from '../headless/checkbox';

export const StyledToggle = ({
    checked,
    defaultChecked = false,
    onChange,
    disabled = false,
    label,
    description,
    name = '',
    value = '',
    variant = 'dark',
    size = 'md',
    className = '',
    ...props
}) => {
    const {
        isChecked,
        toggle,
        getInputProps,
    } = useCheckbox({
        checked,
        defaultChecked,
        onChange,
        disabled,
        name,
        value,
    });

    // Size variants
    const sizes = {
        sm: {
            track: 'w-8 h-4',
            thumb: 'w-3 h-3',
            translate: 'translate-x-4',
            offset: 'left-0.5 top-0.5',
        },
        md: {
            track: 'w-11 h-6',
            thumb: 'w-4 h-4',
            translate: 'translate-x-5',
            offset: 'left-1 top-1',
        },
        lg: {
            track: 'w-14 h-7',
            thumb: 'w-5 h-5',
            translate: 'translate-x-7',
            offset: 'left-1 top-1',
        },
    };

    const sizeStyles = sizes[size] || sizes.md;

    // Get styles based on variant and state
    const getTrackStyles = () => {
        if (isChecked) {
            return 'bg-primary-500';
        }
        // Improved contrast: use lighter gray for OFF state
        return variant === 'dark' ? 'bg-dark-600 border border-dark-500' : 'bg-gray-300';
    };

    const getLabelStyles = () => {
        if (variant === 'dark') {
            // Improved contrast: use white for better visibility
            return disabled ? 'text-dark-400' : 'text-white';
        }
        return disabled ? 'text-gray-400' : 'text-gray-900';
    };

    return (
        <label
            className={`
                flex items-center justify-between cursor-pointer group
                ${disabled ? 'cursor-not-allowed' : ''}
                ${className}
            `}
            {...props}
        >
            {/* Label and description */}
            {(label || description) && (
                <div className="flex flex-col mr-4">
                    {label && (
                        <span className={`text-sm font-medium ${getLabelStyles()}`}>
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className={`text-xs ${variant === 'dark' ? 'text-dark-300' : 'text-gray-600'}`}>
                            {description}
                        </span>
                    )}
                </div>
            )}

            {/* Toggle switch */}
            <div className="relative">
                {/* Hidden input */}
                <input
                    {...getInputProps()}
                    className="peer sr-only"
                />

                {/* Track */}
                <div
                    onClick={disabled ? undefined : toggle}
                    className={`
                        ${sizeStyles.track}
                        rounded-full transition-colors duration-200
                        ${getTrackStyles()}
                        ${disabled ? 'opacity-50' : ''}
                        peer-focus:ring-2 peer-focus:ring-primary-500/40 peer-focus:ring-offset-1
                    `}
                />

                {/* Thumb */}
                <div
                    className={`
                        absolute ${sizeStyles.offset}
                        ${sizeStyles.thumb}
                        bg-white rounded-full shadow-sm
                        transition-transform duration-200
                        pointer-events-none
                        ${isChecked ? sizeStyles.translate : 'translate-x-0'}
                    `}
                />
            </div>
        </label>
    );
};

export default StyledToggle;
