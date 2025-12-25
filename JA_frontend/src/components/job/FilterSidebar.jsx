
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { MapPin, DollarSign, Filter } from 'lucide-react';

const EMP_TYPES = [
    { id: 'Full-time', label: 'Full-time' },
    { id: 'Part-time', label: 'Part-time' },
    { id: 'Internship', label: 'Internship' },
    { id: 'Contract', label: 'Contract' }
];

const LOCATIONS = [
    "Vietnam",
    "Thailand",
    "Singapore",
    "Malaysia"
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

            {/* Employment Type (Toggleable Custom Checkboxes) */}
            <div>
                <h3 className={sectionTitleClass}>Employment Type</h3>
                <div className="space-y-2">
                    {EMP_TYPES.map((type) => {
                        const isSelected = filters.employmentType === type.id;
                        return (
                            <div
                                key={type.id}
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => handleChange('employmentType', isSelected ? null : type.id)}
                            >
                                <div className="relative flex items-center justify-center">
                                    <div className={`
                                        w-5 h-5 border rounded transition-all flex items-center justify-center
                                        ${isSelected
                                            ? 'bg-primary-500 border-primary-500'
                                            : isDark ? 'border-dark-600 bg-dark-700' : 'border-gray-300 bg-white'
                                        }
                                    `}>
                                        {isSelected && (
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className={`text-sm select-none ${isDark ? 'text-dark-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {type.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Location (Dropdown) */}
            <div>
                <h3 className={sectionTitleClass}>Location</h3>
                <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                    <select
                        value={filters.location || ''}
                        onChange={(e) => handleChange('location', e.target.value)}
                        className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                    >
                        <option value="">All Locations</option>
                        {LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
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

            {/* Fresher Friendly */}
            <div>
                <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex flex-col">
                        <span className={sectionTitleClass + " mb-0"}>Fresher Friendly</span>
                        <span className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Only show jobs suitable for freshers</span>
                    </div>

                    <div className="relative">
                        <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={filters.fresher || false}
                            onChange={(e) => handleChange('fresher', e.target.checked)}
                        />
                        <div className={`
                            w-11 h-6 rounded-full transition-colors
                            ${isDark ? 'bg-dark-700' : 'bg-gray-200'}
                            peer-checked:bg-primary-500
                        `}></div>
                        <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default FilterSidebar;
