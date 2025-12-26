/**
 * Phone Input Component with Country Code Selector
 * 
 * Features:
 * - Country dial code dropdown with flags
 * - Search/filter countries
 * - Grouped by region
 * - Theme-aware (dark/light mode)
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Phone } from 'lucide-react';
import { COUNTRIES, getCountriesByRegion, REGIONS } from '../../data/countries';

/**
 * PhoneInput - Phone number input with country code selector
 */
export default function PhoneInput({
    label,
    name,
    value = '',
    onChange,
    onBlur,
    error,
    placeholder = 'Enter phone number',
    required,
    disabled,
    variant = 'dark',
    className = '',
    defaultCountry = 'VN',
}) {
    // Parse value to extract dial code and number
    const parsePhoneValue = (val) => {
        if (!val) return { dialCode: '', number: '' };

        // Find matching dial code
        const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
        for (const country of sortedCountries) {
            if (val.startsWith(country.dialCode)) {
                return {
                    dialCode: country.dialCode,
                    number: val.slice(country.dialCode.length).trim(),
                };
            }
        }
        return { dialCode: '', number: val };
    };

    const initialParsed = parsePhoneValue(value);
    const defaultCountryData = COUNTRIES.find(c => c.value === defaultCountry) || COUNTRIES[0];

    const [selectedCountry, setSelectedCountry] = useState(
        initialParsed.dialCode
            ? COUNTRIES.find(c => c.dialCode === initialParsed.dialCode) || defaultCountryData
            : defaultCountryData
    );
    const [phoneNumber, setPhoneNumber] = useState(initialParsed.number);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Theme variants
    const themes = {
        dark: {
            container: 'bg-dark-800/50 border-dark-600 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
            label: 'text-sm font-medium text-dark-200 mb-1.5 block',
            button: 'bg-dark-700 hover:bg-dark-600 text-white border-r border-dark-600',
            input: 'bg-transparent text-white placeholder:text-dark-500 focus:outline-none',
            dropdown: 'bg-dark-800 border-dark-600 shadow-xl',
            dropdownItem: 'hover:bg-dark-700 text-white',
            dropdownItemActive: 'bg-primary-500/20 text-primary-300',
            search: 'bg-dark-700 border-dark-600 text-white placeholder:text-dark-500',
            groupHeader: 'text-dark-400 bg-dark-900/50',
            error: 'text-red-400 text-xs flex items-center gap-1.5 mt-1.5',
            requiredMark: 'text-red-400 ml-1',
        },
        light: {
            container: 'bg-white border-gray-300 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
            label: 'text-sm font-medium text-gray-700 mb-1.5 block',
            button: 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-r border-gray-300',
            input: 'bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none',
            dropdown: 'bg-white border-gray-200 shadow-xl',
            dropdownItem: 'hover:bg-gray-50 text-gray-900',
            dropdownItemActive: 'bg-primary-50 text-primary-700',
            search: 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400',
            groupHeader: 'text-gray-500 bg-gray-50',
            error: 'text-red-600 text-xs flex items-center gap-1.5 mt-1.5',
            requiredMark: 'text-red-500 ml-1',
        },
    };

    const theme = themes[variant] || themes.dark;

    // Group countries by region and filter by search
    const filteredCountries = useMemo(() => {
        if (!searchQuery) return getCountriesByRegion();

        const query = searchQuery.toLowerCase();
        const filtered = COUNTRIES.filter(c =>
            c.label.toLowerCase().includes(query) ||
            c.value.toLowerCase().includes(query) ||
            c.dialCode.includes(searchQuery)
        );

        // Group filtered results
        const grouped = {};
        filtered.forEach(country => {
            if (!grouped[country.region]) {
                grouped[country.region] = [];
            }
            grouped[country.region].push(country);
        });
        return grouped;
    }, [searchQuery]);

    // Sync internal state when external value changes
    useEffect(() => {
        const parsed = parsePhoneValue(value);

        // Update selected country if dial code changed
        if (parsed.dialCode) {
            const matchingCountry = COUNTRIES.find(c => c.dialCode === parsed.dialCode);
            if (matchingCountry && matchingCountry.value !== selectedCountry.value) {
                setSelectedCountry(matchingCountry);
            }
        }

        // Update phone number if different
        if (parsed.number !== phoneNumber) {
            setPhoneNumber(parsed.number);
        }
    }, [value]); // Only depend on value, not internal state to avoid loops

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

    // Update parent value when country or number changes
    const updateValue = (country, number) => {
        const fullNumber = number ? `${country.dialCode}${number}` : '';
        if (onChange) {
            onChange({
                target: {
                    name,
                    value: fullNumber,
                },
            });
        }
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        setSearchQuery('');
        updateValue(country, phoneNumber);
        inputRef.current?.focus();
    };

    const handleNumberChange = (e) => {
        const newNumber = e.target.value.replace(/[^\d\s-]/g, '');
        setPhoneNumber(newNumber);
        updateValue(selectedCountry, newNumber);
    };

    const handleBlur = (e) => {
        if (onBlur) {
            onBlur({
                target: {
                    name,
                    value: phoneNumber ? `${selectedCountry.dialCode}${phoneNumber}` : '',
                },
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
                <div className={`
          flex items-center h-12 rounded-xl border transition-all duration-200
          ${theme.container}
          ${error ? 'border-red-500 focus-within:ring-red-500/20' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
                    {/* Country Selector Button */}
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className={`
              flex items-center gap-2 px-3 h-full rounded-l-xl transition-colors
              ${theme.button}
            `}
                    >
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Phone Number Input */}
                    <div className="flex-1 flex items-center px-3">
                        <Phone className={`w-4 h-4 mr-2 ${variant === 'dark' ? 'text-dark-400' : 'text-gray-400'}`} />
                        <input
                            ref={inputRef}
                            type="tel"
                            name={name}
                            value={phoneNumber}
                            onChange={handleNumberChange}
                            onBlur={handleBlur}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={`flex-1 h-full ${theme.input}`}
                        />
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className={`
            absolute z-50 w-full mt-2 rounded-xl border overflow-hidden
            ${theme.dropdown}
          `}>
                        {/* Search */}
                        <div className="p-2 border-b border-dark-600">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${variant === 'dark' ? 'text-dark-400' : 'text-gray-400'}`} />
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
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        <X className={`w-4 h-4 ${variant === 'dark' ? 'text-dark-400' : 'text-gray-400'}`} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Country List */}
                        <div className="max-h-64 overflow-y-auto">
                            {Object.entries(filteredCountries).map(([region, countries]) => (
                                <div key={region}>
                                    <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider sticky top-0 ${theme.groupHeader}`}>
                                        {region}
                                    </div>
                                    {countries.map((country) => (
                                        <button
                                            key={country.value}
                                            type="button"
                                            onClick={() => handleCountrySelect(country)}
                                            className={`
                        w-full flex items-center gap-3 px-3 py-2.5 transition-colors
                        ${selectedCountry.value === country.value ? theme.dropdownItemActive : theme.dropdownItem}
                      `}
                                        >
                                            <span className="text-xl">{country.flag}</span>
                                            <span className="flex-1 text-left">{country.label}</span>
                                            <span className={`text-sm ${variant === 'dark' ? 'text-dark-400' : 'text-gray-500'}`}>
                                                {country.dialCode}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ))}

                            {Object.keys(filteredCountries).length === 0 && (
                                <div className="py-8 text-center text-dark-400">
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
