/**
 * FilterSidebar Component
 * 
 * Job search filter sidebar using Headless UI components.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses Headless UI components
 * - Uses StyledCheckbox for employment type selection
 * - Uses StyledSelect for location dropdown
 * - Uses StyledToggle for fresher friendly switch
 */
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, DollarSign, Filter } from 'lucide-react';
import { StyledCheckbox, StyledToggle, StyledSelect } from '../styled';

const EMP_TYPES = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Contract', label: 'Contract' }
];

const LOCATIONS = [
    { value: '', label: 'All Locations' },
    { value: 'Vietnam', label: 'Vietnam' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Malaysia', label: 'Malaysia' }
];

const FilterSidebar = ({ filters, onFilterChange, onReset, className = '' }) => {
    const { isDark } = useTheme();

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

            {/* Employment Type - Using Headless Checkbox */}
            <div>
                <h3 className={sectionTitleClass}>Employment Type</h3>
                <div className="space-y-2">
                    {EMP_TYPES.map((type) => {
                        const isSelected = filters.employmentType === type.value;
                        return (
                            <StyledCheckbox
                                key={type.value}
                                checked={isSelected}
                                onChange={(checked) => handleChange('employmentType', checked ? type.value : null)}
                                label={type.label}
                                variant={isDark ? 'dark' : 'light'}
                                size="md"
                            />
                        );
                    })}
                </div>
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
                        <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minSalary || ''}
                            onChange={(e) => handleChange('minSalary', e.target.value)}
                            className={`${inputClass} pl-8`}
                        />
                    </div>
                    <span className={isDark ? 'text-dark-400' : 'text-gray-400'}>-</span>
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
