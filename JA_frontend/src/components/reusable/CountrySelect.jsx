/**
 * Country Select Component with Regional Grouping
 * 
 * Features:
 * - Complete list of all countries
 * - Grouped by region
 * - Country flags
 * - Search functionality
 * - Theme-aware (dark/light mode)
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, MapPin, Check } from 'lucide-react';
import { COUNTRIES, getCountriesByRegion } from '../../data/countries';

/**
 * CountrySelect - Country selector with flags and regional grouping
 */
export default function CountrySelect({
    label,
    name,
    value = '',
    onChange,
    onBlur,
    error,
    placeholder = 'Select your country',
    required,
    disabled,
    variant = 'dark',
    className = '',
    icon: Icon = MapPin,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const selectedCountry = COUNTRIES.find(c => c.value === value);

    // Theme variants
    const themes = {
        dark: {
            container: 'bg-dark-800/50 border-dark-600 hover:border-dark-500',
            containerFocus: 'border-primary-500 ring-2 ring-primary-500/20',
            label: 'text-sm font-medium text-dark-200 mb-1.5 block',
            button: 'text-white',
            buttonPlaceholder: 'text-dark-500',
            dropdown: 'bg-dark-800 border-dark-600 shadow-2xl',
            dropdownItem: 'hover:bg-dark-700 text-white',
            dropdownItemActive: 'bg-primary-500/20 text-primary-300',
            search: 'bg-dark-700 border-dark-600 text-white placeholder:text-dark-500',
            groupHeader: 'text-dark-400 bg-dark-900/50',
            error: 'text-red-400 text-xs flex items-center gap-1.5 mt-1.5',
            requiredMark: 'text-red-400 ml-1',
            iconClass: 'text-dark-400',
        },
        light: {
            container: 'bg-white border-gray-300 hover:border-gray-400',
            containerFocus: 'border-primary-500 ring-2 ring-primary-500/20',
            label: 'text-sm font-medium text-gray-700 mb-1.5 block',
            button: 'text-gray-900',
            buttonPlaceholder: 'text-gray-400',
            dropdown: 'bg-white border-gray-200 shadow-2xl',
            dropdownItem: 'hover:bg-gray-50 text-gray-900',
            dropdownItemActive: 'bg-primary-50 text-primary-700',
            search: 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400',
            groupHeader: 'text-gray-500 bg-gray-50',
            error: 'text-red-600 text-xs flex items-center gap-1.5 mt-1.5',
            requiredMark: 'text-red-500 ml-1',
            iconClass: 'text-gray-400',
        },
    };

    const theme = themes[variant] || themes.dark;

    // Group and filter countries
    const filteredCountries = useMemo(() => {
        if (!searchQuery) return getCountriesByRegion();

        const query = searchQuery.toLowerCase();
        const filtered = COUNTRIES.filter(c =>
            c.label.toLowerCase().includes(query) ||
            c.value.toLowerCase().includes(query)
        );

        const grouped = {};
        filtered.forEach(country => {
            if (!grouped[country.region]) {
                grouped[country.region] = [];
            }
            grouped[country.region].push(country);
        });
        return grouped;
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (country) => {
        if (onChange) {
            onChange({
                target: {
                    name,
                    value: country.value,
                },
            });
        }
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleBlurWrapper = () => {
        if (onBlur) {
            onBlur({
                target: { name, value },
            });
        }
    };

    return (
        <div className={className}>
            {label && (
                <label className={theme.label}>
                    {label}
                    {required && <span className={theme.requiredMark}>*</span>}
                </label>
            )}

            <div className="relative" ref={dropdownRef}>
                {/* Select Button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    onBlur={handleBlurWrapper}
                    disabled={disabled}
                    className={`
            w-full h-12 px-4 rounded-xl border transition-all duration-200
            flex items-center gap-3
            ${theme.container}
            ${isOpen ? theme.containerFocus : ''}
            ${error ? 'border-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
                >
                    {Icon && (
                        <Icon className={`w-5 h-5 ${theme.iconClass}`} />
                    )}

                    {selectedCountry ? (
                        <>
                            <span className="text-xl">{selectedCountry.flag}</span>
                            <span className={`flex-1 text-left ${theme.button}`}>{selectedCountry.label}</span>
                        </>
                    ) : (
                        <span className={`flex-1 text-left ${theme.buttonPlaceholder}`}>{placeholder}</span>
                    )}

                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${theme.iconClass}`} />
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className={`
            absolute z-50 w-full mt-2 rounded-xl border overflow-hidden
            ${theme.dropdown}
          `}>
                        {/* Search */}
                        <div className="p-2 border-b border-dark-600">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.iconClass}`} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search country..."
                                    className={`w-full h-10 pl-9 pr-8 rounded-lg border ${theme.search} focus:outline-none`}
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        <X className={`w-4 h-4 ${theme.iconClass}`} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Country List */}
                        <div className="max-h-72 overflow-y-auto">
                            {Object.entries(filteredCountries).map(([region, countries]) => (
                                <div key={region}>
                                    <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${theme.groupHeader}`}>
                                        {region}
                                    </div>
                                    {countries.map((country) => (
                                        <button
                                            key={country.value}
                                            type="button"
                                            onClick={() => handleSelect(country)}
                                            className={`
                        w-full flex items-center gap-3 px-3 py-2.5 transition-colors
                        ${value === country.value ? theme.dropdownItemActive : theme.dropdownItem}
                      `}
                                        >
                                            <span className="text-xl">{country.flag}</span>
                                            <span className="flex-1 text-left">{country.label}</span>
                                            {value === country.value && (
                                                <Check className="w-4 h-4 text-primary-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ))}

                            {Object.keys(filteredCountries).length === 0 && (
                                <div className={`py-8 text-center ${theme.buttonPlaceholder}`}>
                                    No countries found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className={theme.error}>
                    <span className="w-3.5 h-3.5">⚠</span>
                    {error}
                </p>
            )}
        </div>
    );
}
