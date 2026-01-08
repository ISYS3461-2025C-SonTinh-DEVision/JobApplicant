/**
 * Styled Select Component
 * 
 * Pre-styled version of headless Select using DEVision design system.
 * Redesigned dropdown with proper dark theme matching.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 */
import React from 'react';
import { Select, useSelect } from '../headless/select';
import { ChevronDown, Check } from 'lucide-react';

export const StyledSelect = ({
    options = [],
    value,
    defaultValue,
    onChange,
    placeholder = 'Select...',
    label,
    icon: Icon,
    error,
    disabled = false,
    required = false,
    variant = 'dark',
    className = '',
    ...props
}) => {
    const isDark = variant === 'dark';

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className={`block text-sm font-medium ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <Select
                options={options}
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className="relative"
                {...props}
            >
                {({ isOpen, displayValue, hasValue, filteredOptions }) => (
                    <>
                        {/* Trigger Button - matches dark theme */}
                        <Select.Trigger
                            className={`
                                w-full flex items-center justify-between gap-2
                                px-4 py-3 rounded-xl border
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
                                ${isDark
                                    ? 'bg-dark-800 border-dark-600 text-white hover:border-primary-500/50'
                                    : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'}
                                ${error ? 'border-red-500/50 focus:ring-red-500/40 focus:border-red-500' : ''}
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                ${Icon ? 'pl-11' : ''}
                            `}
                        >
                            {Icon && (
                                <Icon className={`absolute left-3 w-5 h-5 ${hasValue
                                        ? (isDark ? 'text-white' : 'text-gray-700')
                                        : (isDark ? 'text-dark-400' : 'text-gray-400')
                                    }`} />
                            )}
                            <span className={hasValue ? '' : (isDark ? 'text-dark-400' : 'text-gray-400')}>
                                {displayValue}
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-dark-400' : 'text-gray-400'}`}
                            />
                        </Select.Trigger>

                        {/* Dropdown Options Panel - Matches dark theme */}
                        <Select.Options
                            className={`
                                absolute z-50 w-full mt-2 py-1
                                rounded-xl border overflow-hidden
                                max-h-60 overflow-y-auto
                                ${isDark
                                    ? 'bg-dark-800 border-dark-600 shadow-xl shadow-black/40'
                                    : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50'}
                            `}
                        >
                            {filteredOptions.map((opt) => (
                                <Select.Option
                                    key={opt.value}
                                    value={opt.value}
                                    label={opt.label}
                                    className={({ isSelected, isHighlighted }) => `
                                        flex items-center justify-between px-4 py-3 cursor-pointer
                                        transition-colors duration-100
                                        ${isSelected
                                            ? (isDark
                                                ? 'bg-primary-600/20 text-primary-300'
                                                : 'bg-primary-50 text-primary-700')
                                            : (isDark
                                                ? 'text-dark-200 hover:bg-dark-700 hover:text-white'
                                                : 'text-gray-700 hover:bg-gray-50')
                                        }
                                        ${isHighlighted && !isSelected
                                            ? (isDark ? 'bg-dark-700' : 'bg-gray-100')
                                            : ''
                                        }
                                    `}
                                >
                                    {({ isSelected }) => (
                                        <>
                                            <span className="font-medium">{opt.label}</span>
                                            {isSelected && (
                                                <Check className={`w-4 h-4 ${isDark ? 'text-primary-400' : 'text-primary-600'}`} />
                                            )}
                                        </>
                                    )}
                                </Select.Option>
                            ))}
                        </Select.Options>
                    </>
                )}
            </Select>

            {error && (
                <p className="text-red-400 text-sm" role="alert">{error}</p>
            )}
        </div>
    );
};

// Re-export base components for composition
export { Select, useSelect } from '../headless/select';

export default StyledSelect;
