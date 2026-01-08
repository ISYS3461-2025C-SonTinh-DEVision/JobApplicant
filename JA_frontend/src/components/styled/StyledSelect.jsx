/**
 * Styled Select Component
 * 
 * Pre-styled version of headless Select using DEVision design system.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 * 
 * Usage:
 * <StyledSelect
 *   options={[{ value: 'vn', label: 'Vietnam' }, ...]}
 *   value={country}
 *   onChange={setCountry}
 *   placeholder="Select country"
 *   icon={MapPin}
 * />
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
    // Get styles based on variant
    const getStyles = () => {
        const base = {
            trigger: variant === 'dark'
                ? 'bg-dark-800/50 border-dark-600 text-white hover:border-dark-500'
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400',
            placeholder: variant === 'dark' ? 'text-dark-500' : 'text-gray-400',
            options: variant === 'dark'
                ? 'bg-dark-800 border-dark-600'
                : 'bg-white border-gray-200',
            option: variant === 'dark'
                ? 'text-dark-300 hover:bg-dark-700 hover:text-white'
                : 'text-gray-700 hover:bg-gray-50',
            optionSelected: variant === 'dark'
                ? 'bg-primary-600/20 text-primary-400'
                : 'bg-primary-50 text-primary-700',
            optionHighlighted: variant === 'dark'
                ? 'bg-dark-700'
                : 'bg-gray-100',
        };
        return base;
    };

    const styles = getStyles();

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className={`block text-sm font-medium ${variant === 'dark' ? 'text-dark-300' : 'text-gray-700'}`}>
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
                        <Select.Trigger
                            className={`
                                w-full flex items-center justify-between gap-2
                                px-4 py-3 rounded-xl border
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
                                ${styles.trigger}
                                ${error ? 'border-red-500/50 focus:ring-red-500/40 focus:border-red-500' : ''}
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                ${Icon ? 'pl-11' : ''}
                            `}
                        >
                            {Icon && (
                                <Icon className={`absolute left-3 w-5 h-5 ${hasValue ? (variant === 'dark' ? 'text-white' : 'text-gray-700') : styles.placeholder}`} />
                            )}
                            <span className={hasValue ? '' : styles.placeholder}>
                                {displayValue}
                            </span>
                            <ChevronDown
                                className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${styles.placeholder}`}
                            />
                        </Select.Trigger>

                        <Select.Options
                            className={`
                                absolute z-50 w-full mt-2 py-2
                                rounded-xl border shadow-xl
                                max-h-60 overflow-auto
                                ${styles.options}
                            `}
                        >
                            {filteredOptions.map((opt) => (
                                <Select.Option
                                    key={opt.value}
                                    value={opt.value}
                                    label={opt.label}
                                    className={({ isSelected, isHighlighted }) => `
                                        flex items-center justify-between px-4 py-2.5 cursor-pointer
                                        transition-colors duration-150
                                        ${isSelected ? styles.optionSelected : styles.option}
                                        ${isHighlighted && !isSelected ? styles.optionHighlighted : ''}
                                    `}
                                >
                                    {({ isSelected }) => (
                                        <>
                                            <span>{opt.label}</span>
                                            {isSelected && (
                                                <Check className="w-4 h-4 text-primary-500" />
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
