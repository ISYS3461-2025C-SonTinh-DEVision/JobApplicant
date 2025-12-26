/**
 * Search Profile Page
 * 
 * Manage job search criteria for premium subscribers.
 * Implements Requirements 5.2.x for search profile features.
 * 
 * Features:
 * - Technical skill tags (5.2.2)
 * - Employment status multi-select (5.2.3)
 * - Country selection
 * - Salary range (5.2.4)
 * - Job titles input (5.2.1)
 * 
 * Architecture: Uses HeadlessForm for form management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Save, Trash2, AlertCircle, Check, X, Plus,
    Briefcase, MapPin, DollarSign, Tag as TagIcon, Loader2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHeadlessForm } from '../../components/headless';
import searchProfileService from '../../services/SearchProfileService';

// Common tech skills for autocomplete
const SUGGESTED_SKILLS = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Java', 'Python', 'Go', 'Rust',
    'Spring Boot', 'Django', 'Express.js', 'TypeScript', 'JavaScript',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Kafka',
    'GraphQL', 'REST API', 'gRPC', 'Microservices',
    'React Native', 'Flutter', 'iOS', 'Android',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science',
];

// Employment types
const EMPLOYMENT_TYPES = [
    { id: 'FULLTIME', label: 'Full-time' },
    { id: 'PARTTIME', label: 'Part-time' },
    { id: 'INTERNSHIP', label: 'Internship' },
    { id: 'CONTRACT', label: 'Contract' },
];

// Countries
const COUNTRIES = [
    'Vietnam', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia',
    'Philippines', 'Japan', 'South Korea', 'India', 'Australia',
    'United States', 'United Kingdom', 'Germany', 'Remote',
];

const SearchProfilePage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [skillInput, setSkillInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);

    // Form setup
    const form = useHeadlessForm({
        initialValues: searchProfileService.getDefaultProfile(),
        validate: (values) => {
            const validation = searchProfileService.validateProfile(values);
            if (!validation.isValid) {
                const errors = {};
                validation.errors.forEach((err) => {
                    if (err.includes('skill')) errors.technicalSkills = err;
                    else if (err.includes('salary')) errors.salary = err;
                    else if (err.includes('employment')) errors.employmentTypes = err;
                    else errors.general = err;
                });
                return errors;
            }
            return {};
        },
        onSubmit: async (values) => {
            setSaving(true);
            setError(null);
            setSuccess(null);

            try {
                await searchProfileService.saveSearchProfile(values);
                setSuccess('Search profile saved successfully!');
                setHasExistingProfile(true);
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                setError(err.message || 'Failed to save profile');
            } finally {
                setSaving(false);
            }
        },
    });

    // Load existing profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await searchProfileService.getSearchProfile();
                if (res.data) {
                    form.setValues(res.data);
                    setHasExistingProfile(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle skill addition
    const addSkill = useCallback((skill) => {
        const trimmed = skill.trim();
        if (trimmed && !form.values.technicalSkills.includes(trimmed)) {
            form.setFieldValue('technicalSkills', [...form.values.technicalSkills, trimmed]);
        }
        setSkillInput('');
        setShowSuggestions(false);
    }, [form]);

    // Handle skill removal
    const removeSkill = useCallback((skill) => {
        form.setFieldValue(
            'technicalSkills',
            form.values.technicalSkills.filter((s) => s !== skill)
        );
    }, [form]);

    // Toggle employment type
    const toggleEmploymentType = useCallback((typeId) => {
        const current = form.values.employmentTypes || [];
        if (current.includes(typeId)) {
            form.setFieldValue('employmentTypes', current.filter((t) => t !== typeId));
        } else {
            form.setFieldValue('employmentTypes', [...current, typeId]);
        }
    }, [form]);

    // Handle delete profile
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your search profile?')) return;

        setDeleting(true);
        setError(null);

        try {
            await searchProfileService.deleteSearchProfile();
            form.setValues(searchProfileService.getDefaultProfile());
            setHasExistingProfile(false);
            setSuccess('Profile deleted');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Failed to delete profile');
        } finally {
            setDeleting(false);
        }
    };

    // Filtered suggestions
    const filteredSuggestions = SUGGESTED_SKILLS.filter(
        (skill) =>
            skill.toLowerCase().includes(skillInput.toLowerCase()) &&
            !form.values.technicalSkills.includes(skill)
    ).slice(0, 8);

    // Styles
    const cardClass = isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200';
    const inputClass = `
    w-full px-4 py-3 rounded-xl border outline-none transition-all
    ${isDark
            ? 'bg-dark-900 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
        }
  `;
    const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-gray-600'}`;
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Search Profile</h1>
                    <p className={textSecondary}>
                        Set your job preferences to get personalized alerts
                    </p>
                </div>
                {hasExistingProfile && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/30 text-dark-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                            }`}
                        title="Delete profile"
                    >
                        {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {/* Alerts */}
            {error && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                    }`}>
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {success && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-green-900/20 border-green-900/50 text-green-400' : 'bg-green-50 border-green-200 text-green-600'
                    }`}>
                    <Check className="w-5 h-5" />
                    <span>{success}</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={form.handleSubmit} className="space-y-6">
                {/* Technical Skills */}
                <div className={`p-6 rounded-2xl border ${cardClass}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <TagIcon className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Technical Skills</h2>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Add a skill (e.g., React, Python, AWS)"
                            value={skillInput}
                            onChange={(e) => {
                                setSkillInput(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && skillInput.trim()) {
                                    e.preventDefault();
                                    addSkill(skillInput);
                                }
                            }}
                            className={inputClass}
                        />

                        {/* Suggestions Dropdown */}
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className={`absolute z-10 w-full mt-1 rounded-xl border shadow-lg ${cardClass}`}>
                                {filteredSuggestions.map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => addSkill(skill)}
                                        className={`w-full px-4 py-2 text-left transition-colors first:rounded-t-xl last:rounded-b-xl ${isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Skills */}
                    {form.values.technicalSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {form.values.technicalSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600'
                                        }`}
                                >
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)}>
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {form.errors.technicalSkills && (
                        <p className="mt-2 text-sm text-red-500">{form.errors.technicalSkills}</p>
                    )}
                </div>

                {/* Employment Type */}
                <div className={`p-6 rounded-2xl border ${cardClass}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Employment Type</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {EMPLOYMENT_TYPES.map((type) => {
                            const isSelected = form.values.employmentTypes?.includes(type.id);
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => toggleEmploymentType(type.id)}
                                    className={`
                    px-4 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2
                    ${isSelected
                                            ? 'bg-primary-600 border-primary-500 text-white'
                                            : isDark
                                                ? 'bg-dark-900 border-dark-600 text-dark-300 hover:border-dark-500'
                                                : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                                        }
                  `}
                                >
                                    {isSelected && <Check className="w-4 h-4" />}
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>

                    <p className={`mt-3 text-sm ${textSecondary}`}>
                        If neither Full-time nor Part-time is selected, both will be included in matches.
                    </p>
                </div>

                {/* Location */}
                <div className={`p-6 rounded-2xl border ${cardClass}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Preferred Location</h2>
                    </div>

                    <select
                        value={form.values.country}
                        onChange={(e) => form.setFieldValue('country', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Any Location</option>
                        {COUNTRIES.map((country) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </div>

                {/* Salary Range */}
                <div className={`p-6 rounded-2xl border ${cardClass}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Salary Range (USD/month)</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Minimum</label>
                            <input
                                type="number"
                                placeholder="e.g., 800"
                                value={form.values.minSalary || ''}
                                onChange={(e) => form.setFieldValue('minSalary', e.target.value ? Number(e.target.value) : null)}
                                min={0}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Maximum (optional)</label>
                            <input
                                type="number"
                                placeholder="No limit"
                                value={form.values.maxSalary || ''}
                                onChange={(e) => form.setFieldValue('maxSalary', e.target.value ? Number(e.target.value) : null)}
                                min={0}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {form.errors.salary && (
                        <p className="mt-2 text-sm text-red-500">{form.errors.salary}</p>
                    )}

                    <p className={`mt-3 text-sm ${textSecondary}`}>
                        Jobs with undeclared salary will also be included in matches.
                    </p>
                </div>

                {/* Job Titles */}
                <div className={`p-6 rounded-2xl border ${cardClass}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Desired Job Titles</h2>
                    </div>

                    <textarea
                        placeholder="e.g., Software Engineer; Frontend Developer; Full Stack Developer"
                        value={form.values.jobTitles}
                        onChange={(e) => form.setFieldValue('jobTitles', e.target.value)}
                        rows={3}
                        className={inputClass}
                    />

                    <p className={`mt-2 text-sm ${textSecondary}`}>
                        Separate multiple titles with semicolons (;). Maximum 10 titles.
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className={`
            w-full py-4 rounded-xl font-semibold text-white transition-all
            flex items-center justify-center gap-2
            ${saving
                            ? 'bg-primary-600/50 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30'
                        }
          `}
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Search Profile
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SearchProfilePage;
