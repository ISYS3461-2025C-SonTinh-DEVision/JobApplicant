/**
 * Reusable Form Input Component
 * Supports: icons, password toggle, error states, dark/light themes
 * Used by: Auth forms, Profile forms, Job application forms
 */

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * FormInput - A reusable input field component
 * @param {string} label - Input label
 * @param {string} name - Input name/id
 * @param {string} type - Input type (text, email, password, tel, etc.)
 * @param {string} value - Controlled input value
 * @param {function} onChange - Change handler
 * @param {function} onBlur - Blur handler for validation
 * @param {string} error - Error message to display
 * @param {Component} icon - Lucide icon component
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} autoComplete - Autocomplete attribute
 * @param {string} variant - Theme variant: 'dark' | 'light'
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - For custom input replacement (e.g., select)
 */
export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  placeholder,
  required,
  disabled,
  autoComplete,
  variant = 'dark',
  className = '',
  children,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  // Theme variants
  const themes = {
    dark: {
      label: 'text-sm font-medium text-dark-200 mb-1.5 block',
      input: `
        w-full h-12 px-4 rounded-xl text-white placeholder:text-dark-500
        bg-dark-800/50 border border-dark-600
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
        hover:border-dark-500 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      inputError: 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
      iconClass: 'text-dark-400',
      toggleButton: 'text-dark-400 hover:text-white',
      errorMessage: 'text-red-400 text-xs flex items-center gap-1.5 mt-1.5',
      requiredMark: 'text-red-400 ml-1',
    },
    light: {
      label: 'text-sm font-medium text-gray-700 mb-1.5 block',
      input: `
        w-full h-10 px-3 rounded-md text-gray-900 placeholder:text-gray-400
        bg-white border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
        hover:border-gray-400 transition-all duration-200
        disabled:bg-gray-100 disabled:cursor-not-allowed
      `,
      inputError: 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
      iconClass: 'text-gray-400',
      toggleButton: 'text-gray-400 hover:text-gray-700',
      errorMessage: 'text-red-600 text-xs flex items-center gap-1.5 mt-1.5',
      requiredMark: 'text-red-500 ml-1',
    },
  };

  const theme = themes[variant] || themes.dark;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className={theme.label}>
          {label}
          {required && <span className={theme.requiredMark}>*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.iconClass} pointer-events-none`} />
        )}
        {children || (
          <input
            id={name}
            name={name}
            type={isPassword && showPassword ? 'text' : type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`
              ${theme.input}
              ${Icon ? 'pl-12' : ''}
              ${isPassword ? 'pr-12' : ''}
              ${error ? theme.inputError : ''}
            `}
          />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.toggleButton} transition-colors`}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className={theme.errorMessage}>
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormSelect - A reusable select dropdown component
 */
export function FormSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  options = [],
  placeholder = 'Select an option',
  required,
  disabled,
  variant = 'dark',
  className = '',
}) {
  const themes = {
    dark: {
      label: 'text-sm font-medium text-dark-200 mb-1.5 block',
      select: `
        w-full h-12 px-4 rounded-xl text-white
        bg-dark-800/50 border border-dark-600
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
        hover:border-dark-500 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        appearance-none cursor-pointer
        bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%2394A3B8%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')]
        bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]
      `,
      selectError: 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
      iconClass: 'text-dark-400',
      errorMessage: 'text-red-400 text-xs flex items-center gap-1.5 mt-1.5',
      requiredMark: 'text-red-400 ml-1',
      optionBg: 'bg-dark-800',
    },
    light: {
      label: 'text-sm font-medium text-gray-700 mb-1.5 block',
      select: `
        w-full h-10 px-3 rounded-md text-gray-900
        bg-white border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
        hover:border-gray-400 transition-all duration-200
        disabled:bg-gray-100 disabled:cursor-not-allowed
        appearance-none cursor-pointer
      `,
      selectError: 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
      iconClass: 'text-gray-400',
      errorMessage: 'text-red-600 text-xs flex items-center gap-1.5 mt-1.5',
      requiredMark: 'text-red-500 ml-1',
      optionBg: 'bg-white',
    },
  };

  const theme = themes[variant] || themes.dark;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className={theme.label}>
          {label}
          {required && <span className={theme.requiredMark}>*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.iconClass} pointer-events-none`} />
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            ${theme.select}
            ${Icon ? 'pl-12' : ''}
            ${error ? theme.selectError : ''}
          `}
        >
          <option value="" className={theme.optionBg}>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className={theme.optionBg}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className={theme.errorMessage}>
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * FormTextarea - A reusable textarea component
 */
export function FormTextarea({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required,
  disabled,
  rows = 4,
  maxLength,
  variant = 'dark',
  className = '',
}) {
  const themes = {
    dark: {
      label: 'text-sm font-medium text-dark-200 mb-1.5 block',
      textarea: `
        w-full px-4 py-3 rounded-xl text-white placeholder:text-dark-500
        bg-dark-800/50 border border-dark-600
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
        hover:border-dark-500 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed resize-none
      `,
      textareaError: 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
      errorMessage: 'text-red-400 text-xs flex items-center gap-1.5 mt-1.5',
      requiredMark: 'text-red-400 ml-1',
      charCount: 'text-dark-500 text-xs text-right mt-1',
    },
    light: {
      label: 'text-sm font-medium text-gray-700 mb-1.5 block',
      textarea: `
        w-full px-3 py-2 rounded-md text-gray-900 placeholder:text-gray-400
        bg-white border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
        hover:border-gray-400 transition-all duration-200
        disabled:bg-gray-100 disabled:cursor-not-allowed resize-none
      `,
      textareaError: 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
      errorMessage: 'text-red-600 text-xs flex items-center gap-1.5 mt-1.5',
      requiredMark: 'text-red-500 ml-1',
      charCount: 'text-gray-400 text-xs text-right mt-1',
    },
  };

  const theme = themes[variant] || themes.dark;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className={theme.label}>
          {label}
          {required && <span className={theme.requiredMark}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`
          ${theme.textarea}
          ${error ? theme.textareaError : ''}
        `}
      />
      {maxLength && (
        <p className={theme.charCount}>
          {value?.length || 0} / {maxLength}
        </p>
      )}
      {error && (
        <p className={theme.errorMessage}>
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;

