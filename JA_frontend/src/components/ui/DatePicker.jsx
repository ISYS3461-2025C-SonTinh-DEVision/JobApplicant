/**
 * DatePicker Component
 * 
 * Architecture: A.2.b - Custom Form Components
 * A beautiful, user-friendly date picker with calendar popup
 * 
 * Features:
 * - DD/MM/YYYY format display
 * - Month/Year selector with calendar grid
 * - Smooth animations and transitions
 * - Dark/Light mode support
 * - Min/Max date validation
 * - Keyboard navigation
 * - Click outside to close
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Month names for display
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Day names for calendar grid
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Get number of days in a month
 */
const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

/**
 * Get the first day of the month (0 = Sunday, 6 = Saturday)
 */
const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

/**
 * Format date to DD/MM/YYYY
 */
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Parse date from various formats
 */
const parseDate = (dateString) => {
    if (!dateString) return null;

    // Try YYYY-MM-DD or YYYY-MM format
    if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length >= 2) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parts[2] ? parseInt(parts[2], 10) : 1;
            return new Date(year, month, day);
        }
    }

    // Try DD/MM/YYYY format
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
    }

    return null;
};

const DatePicker = ({
    value,
    onChange,
    label,
    name,
    placeholder = 'DD/MM/YYYY',
    error,
    required,
    disabled,
    min,
    max,
    className = '',
    variant = 'light',
    showDayPicker = true, // If false, only show month/year picker
}) => {
    const { isDark: themeDark } = useTheme();
    const isDark = variant === 'dark' || themeDark;

    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        const parsed = parseDate(value);
        return parsed || new Date();
    });
    const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'

    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Parse min/max dates
    const minDate = parseDate(min);
    const maxDate = parseDate(max);

    // Update viewDate when value changes
    useEffect(() => {
        if (value) {
            const parsed = parseDate(value);
            if (parsed) {
                setViewDate(parsed);
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    /**
     * Check if a date is within min/max bounds
     */
    const isDateInRange = useCallback((date) => {
        if (minDate && date < minDate) return false;
        if (maxDate && date > maxDate) return false;
        return true;
    }, [minDate, maxDate]);

    /**
     * Handle date selection
     */
    const handleDateSelect = (day) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

        if (!isDateInRange(selectedDate)) return;

        // Convert to YYYY-MM-DD format for internal storage
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');

        // If showDayPicker is false, use YYYY-MM format
        const formattedValue = showDayPicker
            ? `${year}-${month}-${dayStr}`
            : `${year}-${month}`;

        // Call onChange with synthetic event for form compatibility
        onChange({
            target: {
                name,
                value: formattedValue
            }
        });

        setIsOpen(false);
    };

    /**
     * Handle month selection in month picker mode
     */
    const handleMonthSelect = (monthIndex) => {
        const newDate = new Date(viewDate.getFullYear(), monthIndex, 1);

        if (showDayPicker) {
            setViewDate(newDate);
            setViewMode('days');
        } else {
            // For month-only picker, select the month directly
            const year = newDate.getFullYear();
            const month = String(monthIndex + 1).padStart(2, '0');

            onChange({
                target: {
                    name,
                    value: `${year}-${month}`
                }
            });
            setIsOpen(false);
        }
    };

    /**
     * Handle year selection
     */
    const handleYearSelect = (year) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setViewMode('months');
    };

    /**
     * Navigate months/years
     */
    const navigate = (direction) => {
        const newDate = new Date(viewDate);

        if (viewMode === 'days') {
            newDate.setMonth(newDate.getMonth() + direction);
        } else if (viewMode === 'months') {
            newDate.setFullYear(newDate.getFullYear() + direction);
        } else {
            newDate.setFullYear(newDate.getFullYear() + direction * 12);
        }

        setViewDate(newDate);
    };

    /**
     * Render calendar days grid
     */
    const renderDaysGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const selectedDate = parseDate(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];

        // Empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isSelected = selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;
            const isToday = date.toDateString() === today.toDateString();
            const isDisabled = !isDateInRange(date);

            days.push(
                <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateSelect(day)}
                    className={`
            w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150
            flex items-center justify-center
            ${isSelected
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : isToday
                                ? isDark
                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                    : 'bg-primary-100 text-primary-600 border border-primary-200'
                                : isDark
                                    ? 'text-dark-200 hover:bg-dark-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                        }
            ${isDisabled
                            ? 'opacity-30 cursor-not-allowed'
                            : 'cursor-pointer hover:scale-105 active:scale-95'
                        }
          `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    /**
     * Render months grid
     */
    const renderMonthsGrid = () => {
        const selectedDate = parseDate(value);
        const currentYear = viewDate.getFullYear();

        return MONTHS_SHORT.map((month, index) => {
            const isSelected = selectedDate &&
                selectedDate.getMonth() === index &&
                selectedDate.getFullYear() === currentYear;

            // Check if this month is in range
            const monthStart = new Date(currentYear, index, 1);
            const monthEnd = new Date(currentYear, index + 1, 0);
            const isDisabled = (minDate && monthEnd < minDate) || (maxDate && monthStart > maxDate);

            return (
                <button
                    key={month}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleMonthSelect(index)}
                    className={`
            py-3 px-4 rounded-xl text-sm font-medium transition-all duration-150
            ${isSelected
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : isDark
                                ? 'text-dark-200 hover:bg-dark-600'
                                : 'text-gray-700 hover:bg-gray-100'
                        }
            ${isDisabled
                            ? 'opacity-30 cursor-not-allowed'
                            : 'cursor-pointer hover:scale-105 active:scale-95'
                        }
          `}
                >
                    {month}
                </button>
            );
        });
    };

    /**
     * Render years grid
     */
    const renderYearsGrid = () => {
        const selectedDate = parseDate(value);
        const currentYear = viewDate.getFullYear();
        const startYear = Math.floor(currentYear / 12) * 12;

        return Array.from({ length: 12 }, (_, i) => {
            const year = startYear + i;
            const isSelected = selectedDate && selectedDate.getFullYear() === year;

            // Check if this year is in range
            const yearStart = new Date(year, 0, 1);
            const yearEnd = new Date(year, 11, 31);
            const isDisabled = (minDate && yearEnd < minDate) || (maxDate && yearStart > maxDate);

            return (
                <button
                    key={year}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleYearSelect(year)}
                    className={`
            py-3 px-4 rounded-xl text-sm font-medium transition-all duration-150
            ${isSelected
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : isDark
                                ? 'text-dark-200 hover:bg-dark-600'
                                : 'text-gray-700 hover:bg-gray-100'
                        }
            ${isDisabled
                            ? 'opacity-30 cursor-not-allowed'
                            : 'cursor-pointer hover:scale-105 active:scale-95'
                        }
          `}
                >
                    {year}
                </button>
            );
        });
    };

    /**
     * Get header title based on view mode
     */
    const getHeaderTitle = () => {
        if (viewMode === 'days') {
            return `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
        } else if (viewMode === 'months') {
            return viewDate.getFullYear().toString();
        } else {
            const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
            return `${startYear} - ${startYear + 11}`;
        }
    };

    /**
     * Handle header click to switch view modes
     */
    const handleHeaderClick = () => {
        if (viewMode === 'days') {
            setViewMode('months');
        } else if (viewMode === 'months') {
            setViewMode('years');
        }
    };

    /**
     * Clear the selected date
     */
    const handleClear = (e) => {
        e.stopPropagation();
        onChange({
            target: {
                name,
                value: ''
            }
        });
    };

    // Display value
    const displayValue = value ? formatDate(parseDate(value)) : '';

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Label */}
            {label && (
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Field */}
            <div
                ref={inputRef}
                onClick={() => !disabled && setIsOpen(true)}
                className={`
          relative flex items-center gap-2 w-full px-4 py-3 border rounded-xl
          transition-all duration-200 cursor-pointer
          ${disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-primary-400'
                    }
          ${isOpen
                        ? 'ring-2 ring-primary-500 border-primary-500'
                        : ''
                    }
          ${error
                        ? 'border-red-500 focus:ring-red-500'
                        : isDark
                            ? 'bg-dark-700 border-dark-600 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                    }
        `}
            >
                <Calendar className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-dark-400' : 'text-gray-400'
                    }`} />

                <span className={`flex-1 ${!displayValue ? (isDark ? 'text-dark-400' : 'text-gray-400') : ''}`}>
                    {displayValue || placeholder}
                </span>

                {/* Clear button */}
                {displayValue && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className={`
              p-1 rounded-full transition-colors
              ${isDark
                                ? 'hover:bg-dark-600 text-dark-400 hover:text-dark-200'
                                : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'
                            }
            `}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}

            {/* Calendar Popup */}
            {isOpen && !disabled && (
                <div className={`
          absolute z-50 mt-2 p-4 rounded-2xl shadow-2xl border
          animate-fade-in
          ${isDark
                        ? 'bg-dark-800 border-dark-600'
                        : 'bg-white border-gray-200'
                    }
        `}
                    style={{ minWidth: '300px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className={`
                p-2 rounded-lg transition-colors
                ${isDark
                                    ? 'hover:bg-dark-700 text-dark-300'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }
              `}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={handleHeaderClick}
                            className={`
                px-4 py-2 rounded-xl font-semibold text-sm transition-all
                ${isDark
                                    ? 'hover:bg-dark-700 text-white'
                                    : 'hover:bg-gray-100 text-gray-900'
                                }
              `}
                        >
                            {getHeaderTitle()}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(1)}
                            className={`
                p-2 rounded-lg transition-colors
                ${isDark
                                    ? 'hover:bg-dark-700 text-dark-300'
                                    : 'hover:bg-gray-100 text-gray-600'
                                }
              `}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Days Grid */}
                    {viewMode === 'days' && showDayPicker && (
                        <>
                            {/* Day names header */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {DAYS.map(day => (
                                    <div
                                        key={day}
                                        className={`
                      w-9 h-9 flex items-center justify-center text-xs font-medium
                      ${isDark ? 'text-dark-400' : 'text-gray-400'}
                    `}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {renderDaysGrid()}
                            </div>
                        </>
                    )}

                    {/* Months Grid */}
                    {(viewMode === 'months' || (!showDayPicker && viewMode === 'days')) && (
                        <div className="grid grid-cols-3 gap-2">
                            {renderMonthsGrid()}
                        </div>
                    )}

                    {/* Years Grid */}
                    {viewMode === 'years' && (
                        <div className="grid grid-cols-3 gap-2">
                            {renderYearsGrid()}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className={`
            flex items-center justify-between mt-4 pt-3 border-t
            ${isDark ? 'border-dark-600' : 'border-gray-200'}
          `}>
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                setViewDate(today);
                                if (viewMode !== 'days') setViewMode('days');
                            }}
                            className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isDark
                                    ? 'text-primary-400 hover:bg-primary-500/10'
                                    : 'text-primary-600 hover:bg-primary-50'
                                }
              `}
                        >
                            Today
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isDark
                                    ? 'bg-dark-700 text-dark-200 hover:bg-dark-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
              `}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
