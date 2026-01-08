/**
 * Search Profile Sidebar Page
 * 
 * Manage job search criteria - accessible to ALL users from sidebar.
 * Implements Requirements 5.2.x for search profile features.
 * 
 * Premium vs Non-Premium:
 * - Premium users: Get real-time WebSocket notifications when jobs match
 * - Regular users: Can save profile and manually check for matches in Notifications tab
 * 
 * Features:
 * - Technical skill tags with autocomplete (5.2.2)
 * - Job title tags with autocomplete (5.2.1)
 * - Employment status multi-select (5.2.3)
 * - Country selection
 * - Salary range (5.2.4)
 * - Save/Edit/View flow with last updated timestamp
 * 
 * Architecture: A.3.a (Ultimo) - Headless UI Pattern
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save, Trash2, Check, X, Plus, Loader2, Bell, BellRing, Wifi, WifiOff,
    Briefcase, MapPin, DollarSign, Tag as TagIcon, Crown, Info, Edit3,
    CheckCircle, Clock, ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { StyledSelect } from '../../components/styled';
import searchProfileService from '../../services/SearchProfileService';

// Common tech skills for autocomplete
const SUGGESTED_SKILLS = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Java', 'Python', 'Go', 'Rust',
    'Spring Boot', 'Django', 'Express.js', 'TypeScript', 'JavaScript',
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Kafka',
    'GraphQL', 'REST API', 'gRPC', 'Microservices',
    'React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science',
    'Snowflake', 'Spark', 'Hadoop', 'Airflow', 'C++', 'C#', '.NET',
    'PHP', 'Laravel', 'Ruby', 'Rails', 'Scala', 'Elixir',
];

// Common job titles for autocomplete
const SUGGESTED_JOB_TITLES = [
    'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
    'Frontend Developer', 'Senior Frontend Developer', 'Frontend Engineer',
    'Backend Developer', 'Senior Backend Developer', 'Backend Engineer',
    'Full Stack Developer', 'Full Stack Engineer',
    'Mobile Developer', 'iOS Developer', 'Android Developer',
    'DevOps Engineer', 'SRE Engineer', 'Platform Engineer',
    'Data Engineer', 'Data Scientist', 'Machine Learning Engineer', 'AI Engineer',
    'QA Engineer', 'Test Engineer', 'SDET',
    'Tech Lead', 'Engineering Manager', 'CTO',
    'Cloud Engineer', 'Solutions Architect', 'System Administrator',
    'Security Engineer', 'Cybersecurity Analyst',
    'Product Manager', 'Project Manager', 'Scrum Master',
    'UI/UX Designer', 'Product Designer',
    'Database Administrator', 'Data Analyst', 'Business Analyst',
    'Intern', 'Junior Developer', 'Fresher Developer',
];

// Employment types - must match Backend enum: FULL_TIME, PART_TIME, FRESHER, INTERNSHIP, CONTRACT
const EMPLOYMENT_TYPES = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'PART_TIME', label: 'Part-time' },
    { value: 'FRESHER', label: 'Fresher' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'CONTRACT', label: 'Contract' },
];

// Countries
const COUNTRIES = [
    { value: '', label: 'Any Location' },
    { value: 'Vietnam', label: 'Vietnam' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Japan', label: 'Japan' },
    { value: 'South Korea', label: 'South Korea' },
    { value: 'India', label: 'India' },
    { value: 'Australia', label: 'Australia' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Remote', label: 'Remote' },
];

/**
 * Format relative time
 */
const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
};

/**
 * Saved Profile Summary Card
 */
const SavedProfileCard = ({ profile, onEdit, onDelete, isPremium, isDark }) => {
    const navigate = useNavigate();

    return (
        <div className={`
            p-6 rounded-2xl border transition-all
            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
        `}>
            {/* Status Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Profile Active
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        className={`p-2 rounded-lg transition-colors ${isDark
                            ? 'hover:bg-dark-700 text-dark-400 hover:text-primary-400'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-primary-600'
                            }`}
                        title="Edit profile"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className={`p-2 rounded-lg transition-colors ${isDark
                            ? 'hover:bg-red-900/30 text-dark-400 hover:text-red-400'
                            : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                            }`}
                        title="Delete profile"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Last Updated */}
            {profile.updatedAt && (
                <div className={`flex items-center gap-1 text-xs mb-4 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                    <Clock className="w-3 h-3" />
                    Last updated {formatTimeAgo(profile.updatedAt)}
                </div>
            )}

            {/* Profile Summary */}
            <div className="space-y-4">
                {/* Job Titles */}
                {profile.jobTitles?.length > 0 && (
                    <div>
                        <h4 className={`text-xs font-medium mb-2 uppercase tracking-wider ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Looking for
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {profile.jobTitles.map((title) => (
                                <span
                                    key={title}
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-accent-500/20 text-accent-400' : 'bg-accent-50 text-accent-600'
                                        }`}
                                >
                                    {title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {profile.technicalSkills?.length > 0 && (
                    <div>
                        <h4 className={`text-xs font-medium mb-2 uppercase tracking-wider ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {profile.technicalSkills.slice(0, 6).map((skill) => (
                                <span
                                    key={skill}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600'
                                        }`}
                                >
                                    {skill}
                                </span>
                            ))}
                            {profile.technicalSkills.length > 6 && (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-dark-600 text-dark-300' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    +{profile.technicalSkills.length - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Other Criteria */}
                <div className="flex flex-wrap gap-3">
                    {profile.country && (
                        <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            <MapPin className="w-4 h-4" />
                            {profile.country}
                        </div>
                    )}
                    {profile.minSalary && (
                        <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            <DollarSign className="w-4 h-4" />
                            ${profile.minSalary.toLocaleString()}+
                        </div>
                    )}
                    {profile.employmentTypes?.length > 0 && (
                        <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                            <Briefcase className="w-4 h-4" />
                            {profile.employmentTypes.map(t => EMPLOYMENT_TYPES.find(e => e.value === t)?.label).join(', ')}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-dashed flex items-center justify-between"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    {isPremium
                        ? '🔔 Real-time alerts are active'
                        : '💡 Check Notifications for matches'}
                </p>
                <button
                    onClick={() => navigate('/dashboard/notifications')}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'
                        }`}
                >
                    View Matches
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

/**
 * Premium Status Banner Component
 */
const PremiumStatusBanner = ({ isPremium, isConnected, isDark }) => {
    if (isPremium) {
        return (
            <div className={`
                p-4 rounded-xl border flex items-start gap-3 animate-fade-in
                ${isDark
                    ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/30'
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
                }
            `}>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                    <BellRing className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            Real-time Notifications
                        </h3>
                        <Crown className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                        {isConnected ? (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                                <Wifi className="w-3 h-3" />
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                                <WifiOff className="w-3 h-3" /> Reconnecting...
                            </span>
                        )}
                    </div>
                    <p className={`text-sm mt-1 ${isDark ? 'text-amber-400/70' : 'text-amber-600/80'}`}>
                        You'll receive instant notifications when new jobs match your profile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`
            p-4 rounded-xl border flex items-start gap-3
            ${isDark
                ? 'bg-dark-800/50 border-dark-600'
                : 'bg-gray-50 border-gray-200'
            }
        `}>
            <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                <Bell className={`w-5 h-5 ${isDark ? 'text-dark-400' : 'text-gray-500'}`} />
            </div>
            <div className="flex-1">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Manual Matching
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    Save your profile, then check <strong>Notifications</strong> tab for matching jobs.
                </p>
            </div>
        </div>
    );
};

/**
 * Tag Input Component with autocomplete - reusable for skills and job titles
 */
const TagInput = ({
    tags,
    onAddTag,
    onRemoveTag,
    suggestions,
    placeholder,
    label,
    maxTags = 10,
    tagColorClass,
    isDark
}) => {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredSuggestions = suggestions.filter(
        (item) =>
            item.toLowerCase().includes(input.toLowerCase()) &&
            !tags.includes(item)
    ).slice(0, 8);

    const handleAdd = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
            onAddTag(trimmed);
        }
        setInput('');
        setShowSuggestions(false);
    };

    const inputClass = `
        w-full px-4 py-3 rounded-xl border outline-none transition-all
        ${isDark
            ? 'bg-dark-900 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
        }
    `;

    const cardClass = isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200';
    const defaultTagColor = isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600';

    return (
        <div>
            <div className="relative">
                <input
                    type="text"
                    placeholder={tags.length >= maxTags ? `Maximum ${maxTags} items reached` : placeholder}
                    value={input}
                    disabled={tags.length >= maxTags}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim()) {
                            e.preventDefault();
                            handleAdd(input);
                        }
                    }}
                    className={inputClass}
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className={`absolute z-20 w-full mt-1 rounded-xl border shadow-lg max-h-48 overflow-y-auto ${cardClass}`}>
                        {filteredSuggestions.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onMouseDown={() => handleAdd(item)}
                                className={`w-full px-4 py-2.5 text-left transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center gap-2 ${isDark ? 'hover:bg-dark-700 text-dark-300' : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                <Plus className="w-4 h-4 opacity-50" />
                                {item}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${tagColorClass || defaultTagColor}`}
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => onRemoveTag(tag)}
                                className="hover:text-red-400 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Helper text */}
            <div className={`flex justify-between mt-2 text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                <span>{tags.length === 0 ? 'Start typing to see suggestions' : `${tags.length}/${maxTags} selected`}</span>
                {tags.length > 0 && tags.length < maxTags && (
                    <span>Press Enter or click to add</span>
                )}
            </div>
        </div>
    );
};

/**
 * Main Search Profile Sidebar Page
 */
const SearchProfileSidebar = () => {
    const { isDark } = useTheme();
    const { currentUser } = useAuth();
    const { showSuccess, showError, isConnected } = useNotifications();

    const isPremium = currentUser?.isPremium || currentUser?.subscriptionStatus === 'ACTIVE';

    // States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Profile data
    const [savedProfile, setSavedProfile] = useState(null);
    const [formData, setFormData] = useState({
        technicalSkills: [],
        employmentTypes: [],
        country: 'Vietnam',
        minSalary: null,
        maxSalary: null,
        jobTitles: [],
    });

    // Load existing profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await searchProfileService.getSearchProfile();
                console.log('DEBUG: loadProfile response =', res);

                // Check if we have actual profile data (not just truthy empty object)
                // A valid profile should have at least an id and some content
                const hasValidProfile = res.data && (
                    res.data.id ||
                    (res.data.desiredSkills && res.data.desiredSkills.length > 0) ||
                    (res.data.technicalSkills && res.data.technicalSkills.length > 0) ||
                    (res.data.jobTitles && res.data.jobTitles.length > 0)
                );

                console.log('DEBUG: hasValidProfile =', hasValidProfile);

                if (hasValidProfile) {
                    // Parse job titles if it's a string
                    let jobTitles = res.data.jobTitles || [];
                    if (typeof jobTitles === 'string') {
                        jobTitles = jobTitles.split(';').map(t => t.trim()).filter(Boolean);
                    }

                    // Map Backend DTO field names to Frontend form field names:
                    // - desiredSkills (Backend) → technicalSkills (Frontend)
                    // - desiredCountry (Backend) → country (Frontend)
                    const profileData = {
                        technicalSkills: res.data.desiredSkills || res.data.technicalSkills || [],
                        employmentTypes: res.data.employmentTypes || [],
                        country: res.data.desiredCountry || res.data.country || 'Vietnam',
                        minSalary: res.data.minSalary || null,
                        maxSalary: res.data.maxSalary || null,
                        jobTitles: jobTitles,
                        updatedAt: res.data.updatedAt || res.data.createdAt || new Date().toISOString(),
                    };
                    console.log('DEBUG: Setting savedProfile =', profileData);
                    setSavedProfile(profileData);
                    setFormData(profileData);
                } else {
                    // No valid profile - ensure savedProfile stays null
                    console.log('DEBUG: No valid profile, keeping savedProfile as null');
                    setSavedProfile(null);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                // On error, ensure savedProfile is null so form shows
                setSavedProfile(null);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    // Handle form field change
    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Tag handlers for skills
    const addSkill = useCallback((skill) => {
        setFormData(prev => ({
            ...prev,
            technicalSkills: [...prev.technicalSkills, skill]
        }));
    }, []);

    const removeSkill = useCallback((skill) => {
        setFormData(prev => ({
            ...prev,
            technicalSkills: prev.technicalSkills.filter(s => s !== skill)
        }));
    }, []);

    // Tag handlers for job titles
    const addJobTitle = useCallback((title) => {
        setFormData(prev => ({
            ...prev,
            jobTitles: [...prev.jobTitles, title]
        }));
    }, []);

    const removeJobTitle = useCallback((title) => {
        setFormData(prev => ({
            ...prev,
            jobTitles: prev.jobTitles.filter(t => t !== title)
        }));
    }, []);

    // Toggle employment type
    const toggleEmploymentType = useCallback((typeId) => {
        setFormData(prev => {
            const current = prev.employmentTypes || [];
            if (current.includes(typeId)) {
                return { ...prev, employmentTypes: current.filter(t => t !== typeId) };
            }
            return { ...prev, employmentTypes: [...current, typeId] };
        });
    }, []);

    // Handle save
    const handleSave = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.technicalSkills.length === 0) {
            showError('Validation Error', 'Please add at least one technical skill');
            return;
        }

        if (formData.jobTitles.length === 0) {
            showError('Validation Error', 'Please add at least one desired job title');
            return;
        }

        setSaving(true);
        try {
            // Transform Frontend field names to match Backend SearchProfileRequest DTO:
            // - technicalSkills → desiredSkills (List<String>)
            // - jobTitles: keep as array, not semicolon string (List<String>)
            // - country → desiredCountry
            // - add profileName (required by backend)
            // - employmentTypes: already array of enum values
            // - minSalary/maxSalary: numbers
            const dataToSave = {
                profileName: 'My Search Profile',
                desiredSkills: formData.technicalSkills,
                employmentTypes: formData.employmentTypes,
                jobTitles: formData.jobTitles,  // Keep as array for Backend
                desiredCountry: formData.country || 'Vietnam',
                minSalary: formData.minSalary || 0,
                maxSalary: formData.maxSalary || null,
            };

            await searchProfileService.saveSearchProfile(dataToSave);

            const updatedProfile = {
                ...formData,
                updatedAt: new Date().toISOString(),
            };
            setSavedProfile(updatedProfile);
            setIsEditing(false);
            showSuccess('Saved!', 'Your search profile is now active. ' + (isPremium ? "You'll receive real-time alerts." : 'Check Notifications for matches.'));
        } catch (err) {
            showError('Error', err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        setDeleting(true);
        try {
            await searchProfileService.deleteSearchProfile();
            setSavedProfile(null);
            setFormData({
                technicalSkills: [],
                employmentTypes: [],
                country: 'Vietnam',
                minSalary: null,
                maxSalary: null,
                jobTitles: [],
            });
            setShowDeleteConfirm(false);
            showSuccess('Deleted', 'Search profile has been removed');
        } catch (err) {
            showError('Error', err.message || 'Failed to delete profile');
        } finally {
            setDeleting(false);
        }
    };

    // Start editing
    const handleEdit = () => {
        setFormData({ ...savedProfile });
        setIsEditing(true);
    };

    // Cancel editing
    const handleCancel = () => {
        if (savedProfile) {
            setFormData({ ...savedProfile });
        }
        setIsEditing(false);
    };

    // Styles
    const cardClass = `p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`;
    const sectionTitleClass = `flex items-center gap-2 mb-4`;
    const inputClass = `
        w-full px-4 py-3 rounded-xl border outline-none transition-all
        ${isDark
            ? 'bg-dark-900 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
        }
    `;
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                    <p className={textSecondary}>Loading search profile...</p>
                </div>
            </div>
        );
    }

    // Show saved profile view if profile exists and not editing
    if (savedProfile && !isEditing) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Search Profile</h1>
                    <p className={`mt-1 ${textSecondary}`}>
                        Your personalized job matching preferences
                    </p>
                </div>

                {/* Premium Status */}
                <PremiumStatusBanner isPremium={isPremium} isConnected={isConnected} isDark={isDark} />

                {/* Saved Profile Card */}
                <SavedProfileCard
                    profile={savedProfile}
                    onEdit={handleEdit}
                    onDelete={() => setShowDeleteConfirm(true)}
                    isPremium={isPremium}
                    isDark={isDark}
                />

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                        <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl animate-scale-in ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                    <Trash2 className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                </div>
                                <h3 className={`text-lg font-semibold ${textPrimary}`}>
                                    Delete Search Profile?
                                </h3>
                            </div>
                            <p className={`mb-6 ${textSecondary}`}>
                                You'll stop receiving job match notifications. You can create a new profile anytime.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className={`flex-1 px-4 py-2.5 rounded-xl border font-medium transition-colors ${isDark ? 'border-dark-600 text-dark-300 hover:bg-dark-700' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Edit/Create Form
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>
                        {savedProfile ? 'Edit Search Profile' : 'Create Search Profile'}
                    </h1>
                    <p className={`mt-1 ${textSecondary}`}>
                        {savedProfile ? 'Update your job matching preferences' : 'Set up your preferences to find matching jobs'}
                    </p>
                </div>
                {savedProfile && (
                    <button
                        onClick={handleCancel}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
                            ? 'text-dark-300 hover:bg-dark-700'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Premium Status Banner */}
            <PremiumStatusBanner isPremium={isPremium} isConnected={isConnected} isDark={isDark} />

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
                {/* Job Titles - Most important, shown first */}
                <div className={cardClass}>
                    <div className={sectionTitleClass}>
                        <Briefcase className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Desired Job Titles</h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-accent-500/20 text-accent-400' : 'bg-accent-50 text-accent-600'}`}>
                            Required
                        </span>
                    </div>
                    <TagInput
                        tags={formData.jobTitles}
                        onAddTag={addJobTitle}
                        onRemoveTag={removeJobTitle}
                        suggestions={SUGGESTED_JOB_TITLES}
                        placeholder="Search job titles (e.g., Frontend Developer)"
                        maxTags={10}
                        tagColorClass={isDark ? 'bg-accent-500/20 text-accent-400' : 'bg-accent-50 text-accent-600'}
                        isDark={isDark}
                    />
                </div>

                {/* Technical Skills */}
                <div className={cardClass}>
                    <div className={sectionTitleClass}>
                        <TagIcon className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Technical Skills</h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600'}`}>
                            Required
                        </span>
                    </div>
                    <TagInput
                        tags={formData.technicalSkills}
                        onAddTag={addSkill}
                        onRemoveTag={removeSkill}
                        suggestions={SUGGESTED_SKILLS}
                        placeholder="Search skills (e.g., React, Python)"
                        maxTags={15}
                        tagColorClass={isDark ? 'bg-primary-500/20 text-primary-400' : 'bg-primary-50 text-primary-600'}
                        isDark={isDark}
                    />
                </div>

                {/* Employment Type */}
                <div className={cardClass}>
                    <div className={sectionTitleClass}>
                        <Briefcase className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Employment Type</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {EMPLOYMENT_TYPES.map((type) => {
                            const isSelected = formData.employmentTypes?.includes(type.value);
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => toggleEmploymentType(type.value)}
                                    className={`
                                        px-4 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2
                                        ${isSelected
                                            ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20'
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
                    <p className={`mt-3 text-sm flex items-center gap-1 ${textSecondary}`}>
                        <Info className="w-4 h-4" />
                        Select none to include all types
                    </p>
                </div>

                {/* Location */}
                <div className={cardClass}>
                    <div className={sectionTitleClass}>
                        <MapPin className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Preferred Location</h2>
                    </div>
                    <StyledSelect
                        options={COUNTRIES}
                        value={formData.country}
                        onChange={(value) => handleChange('country', value)}
                        placeholder="Select location"
                        icon={MapPin}
                        variant={isDark ? 'dark' : 'light'}
                    />
                </div>

                {/* Salary Range */}
                <div className={cardClass}>
                    <div className={sectionTitleClass}>
                        <DollarSign className={`w-5 h-5 ${textSecondary}`} />
                        <h2 className={`font-semibold ${textPrimary}`}>Minimum Salary (USD/month)</h2>
                    </div>
                    <div className="relative">
                        <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                        <input
                            type="number"
                            placeholder="e.g., 1000"
                            value={formData.minSalary || ''}
                            onChange={(e) => handleChange('minSalary', e.target.value ? Number(e.target.value) : null)}
                            min={0}
                            className={`${inputClass} pl-10`}
                        />
                    </div>
                    <p className={`mt-2 text-sm flex items-center gap-1 ${textSecondary}`}>
                        <Info className="w-4 h-4" />
                        Jobs without salary info will also be shown
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {savedProfile && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={`flex-1 py-4 rounded-xl font-semibold transition-all border ${isDark
                                ? 'border-dark-600 text-dark-300 hover:bg-dark-700'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className={`
                            flex-1 py-4 rounded-xl font-semibold text-white transition-all
                            flex items-center justify-center gap-2
                            ${saving
                                ? 'bg-primary-600/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50'
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
                                {savedProfile ? 'Update Profile' : 'Save Profile'}
                            </>
                        )}
                    </button>
                </div>

                {/* Helper text */}
                {!isPremium && !savedProfile && (
                    <p className={`text-center text-sm ${textSecondary}`}>
                        After saving, visit <strong>Notifications</strong> to check for matching jobs
                    </p>
                )}
            </form>
        </div>
    );
};

export default SearchProfileSidebar;
