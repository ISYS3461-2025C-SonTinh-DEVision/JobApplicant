/**
 * FilterSidebar Component
 * 
 * Job search filter sidebar using Headless UI components.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses Headless UI components
 * - Uses StyledCheckbox for employment type selection (MULTI-SELECT per 4.1.1)
 * - Uses StyledSelect for location dropdown
 * - Uses StyledToggle for fresher friendly switch
 * - Default location: Vietnam (Requirement 4.3.1)
 * - Location filter uses 195+ countries from countries.js
 */
import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, DollarSign, Filter } from 'lucide-react';
import { StyledCheckbox, StyledToggle, StyledSelect } from '../styled';
import { COUNTRIES } from '../../data/countries';

const EMP_TYPES = [
    { value: 'FULLTIME', label: 'Full-time' },
    { value: 'PARTTIME', label: 'Part-time' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'FREELANCE', label: 'Freelance' }
];

// Popular countries to show first
const POPULAR_COUNTRY_CODES = ['VN', 'SG', 'TH', 'MY', 'ID', 'PH', 'JP', 'KR', 'AU', 'US', 'GB', 'DE', 'CA', 'IN'];

const FilterSidebar = ({ filters, onFilterChange, onReset, className = '' }) => {
    const { isDark } = useTheme();

    // Build location options from countries.js data
    const LOCATIONS = useMemo(() => {
        // Start with special options
        const locations = [
            { value: '', label: 'All Locations' },
            { value: 'Remote', label: '🌍 Remote / Worldwide' },
        ];

        // Popular countries first
        const popularCountries = POPULAR_COUNTRY_CODES
            .map(code => COUNTRIES.find(c => c.value === code))
            .filter(Boolean)
            .map(c => ({
                value: c.label, // Use country name as value for backend matching
                label: `${c.flag} ${c.label}`
            }));

        // All other countries
        const otherCountries = COUNTRIES
            .filter(c => !POPULAR_COUNTRY_CODES.includes(c.value))
            .sort((a, b) => a.label.localeCompare(b.label))
            .map(c => ({
                value: c.label, // Use country name as value for backend matching
                label: `${c.flag} ${c.label}`
            }));

        return [...locations, ...popularCountries, ...otherCountries];
    }, []);

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const sectionTitleClass = `text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`;
    const inputClass = `w-full px-3 py-2 rounded-lg text-sm border outline-none transition-colors ${isDark
        ? 'bg-dark-700 border-dark-600 text-white focus:border-primary-500'
        : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
        }`;

    return (
        <div className={`space-y-8 ${className}`}>
            {/* Header / Reset */}
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Filter className="w-5 h-5" />
                    Filters
                </div>
                {(filters.employmentType || filters.location || filters.minSalary || filters.fresher) && (
                    <button
                        onClick={onReset}
                        className="text-xs text-primary-500 hover:text-primary-600 font-medium"
                    >
                        Reset All
                    </button>
                )}
            </div>

            {/* Employment Type - Multi-select per Requirement 4.1.1 */}
            <div>
                <h3 className={sectionTitleClass}>Employment Type</h3>
                <div className="space-y-2">
                    {EMP_TYPES.map((type) => {
                        // Support both array and single value for backward compatibility
                        const selectedTypes = Array.isArray(filters.employmentType)
                            ? filters.employmentType
                            : (filters.employmentType ? [filters.employmentType] : []);
                        const isSelected = selectedTypes.includes(type.value);

                        return (
                            <StyledCheckbox
                                key={type.value}
                                checked={isSelected}
                                onChange={(checked) => {
                                    let newTypes;
                                    if (checked) {
                                        // Add to array
                                        newTypes = [...selectedTypes, type.value];
                                    } else {
                                        // Remove from array
                                        newTypes = selectedTypes.filter(t => t !== type.value);
                                    }
                                    // Return empty array if none selected, or the array
                                    handleChange('employmentType', newTypes.length > 0 ? newTypes : []);
                                }}
                                label={type.label}
                                variant={isDark ? 'dark' : 'light'}
                                size="md"
                            />
                        );
                    })}
                </div>
                {Array.isArray(filters.employmentType) && filters.employmentType.length > 0 && (
                    <p className={`text-xs mt-2 ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                        {filters.employmentType.length} type(s) selected
                    </p>
                )}
            </div>

            {/* Location - Using Headless Select */}
            <div>
                <h3 className={sectionTitleClass}>Location</h3>
                <StyledSelect
                    options={LOCATIONS}
                    value={filters.location || ''}
                    onChange={(value) => handleChange('location', value)}
                    placeholder="All Locations"
                    icon={MapPin}
                    variant={isDark ? 'dark' : 'light'}
                />
            </div>

            {/* Salary Range */}
            <div>
                <h3 className={sectionTitleClass}>Salary Range ($)</h3>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 ${isDark ? 'text-dark-300' : 'text-gray-500'}`} />
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minSalary || ''}
                            onChange={(e) => handleChange('minSalary', e.target.value)}
                            className={`${inputClass} pl-8`}
                        />
                    </div>
                    <span className={isDark ? 'text-dark-200' : 'text-gray-500'}>-</span>
                    <div className="relative flex-1">
                        <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxSalary || ''}
                            onChange={(e) => handleChange('maxSalary', e.target.value)}
                            className={`${inputClass} pl-8`}
                        />
                    </div>
                </div>
            </div>

            {/* Fresher Friendly - Using Headless Toggle */}
            <div>
                <StyledToggle
                    checked={filters.fresher || false}
                    onChange={(checked) => handleChange('fresher', checked)}
                    label="Fresher Friendly"
                    description="Only show jobs suitable for freshers"
                    variant={isDark ? 'dark' : 'light'}
                />
            </div>
        </div>
    );
};

export default FilterSidebar;
