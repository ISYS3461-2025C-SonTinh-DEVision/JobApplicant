/**
 * Profile Dashboard Page
 * 
 * Displays complete user profile with all sections:
 * - Basic Info (Real API data)
 * - Education History (Mock data - API not available)
 * - Work Experience (Mock data - API not available)
 * - Technical Skills (Mock data - API not available)
 * - Portfolio (Mock data - API not available)
 * - Application Statistics (Mock data - API not available)
 * 
 * Architecture:
 * - A.3.a (Ultimo): Uses Headless UI hooks for modal, tabs, form, and data management
 * - A.2.a: Uses reusable UI components
 * - Light/Dark mode support via ThemeContext
 * - Data source indicators (real vs mock data)
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Calendar, Edit, Loader2,
  Briefcase, GraduationCap, Code, Award, FileText, TrendingUp,
  CheckCircle, Clock, XCircle, AlertCircle, Plus, Trash2, ExternalLink,
  Database, Server, Target, Save, Upload, Camera
} from 'lucide-react';
import ProfileService from '../../services/ProfileService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

import {
  useHeadlessModal,
  useHeadlessForm,
  useHeadlessDataList
} from '../../components/headless';

// Import Reusable Components
import { Card, FormInput, ConfirmDialog, SkillIcon, SKILL_ICONS } from '../../components/reusable';

// Import Skills Data for smart skill selection
import { getSkillInfo, getSkillCategory, POPULAR_SKILLS, SKILL_CATEGORIES, searchSkills, getQuickAddSkills } from '../../data/skillsData';

/**
 * Data Source Indicator Component
 * Shows whether data is from real API or mock data
 */
function DataSourceIndicator({ isRealData, className = '' }) {
  const { isDark } = useTheme();

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      {isRealData ? (
        <>
          <Server className="w-3 h-3 text-green-500" />
          <span className={isDark ? 'text-green-400' : 'text-green-600'}>API Data</span>
        </>
      ) : (
        <>
          <Database className="w-3 h-3 text-amber-500" />
          <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>Mock Data</span>
        </>
      )}
    </div>
  );
}

/**
 * Profile Header Section with Avatar and Basic Info
 */
function ProfileHeader({ profile, onEdit, isRealData, onAvatarUpload, uploadingAvatar, avatarInputRef }) {
  const { isDark } = useTheme();
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'No name set';
  const initial = (fullName[0] || 'U').toUpperCase();

  return (
    <div className={`
      relative overflow-hidden rounded-2xl border
      ${isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10" />

      <div className="relative p-6 sm:p-8">
        {/* Data Source Indicator */}
        <div className="absolute top-4 right-4">
          <DataSourceIndicator isRealData={isRealData} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar with Upload Button */}
          <div className="relative group">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
                {initial}
              </div>
            )}

            {/* Avatar Upload Button Overlay */}
            <input
              type="file"
              ref={avatarInputRef}
              onChange={onAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => avatarInputRef?.current?.click()}
              disabled={uploadingAvatar}
              className={`
                absolute bottom-1 right-1 w-10 h-10 rounded-full border-4 flex items-center justify-center
                transition-all duration-200 group-hover:scale-110
                ${isDark ? 'border-dark-800' : 'border-white'}
                ${uploadingAvatar
                  ? 'bg-dark-600 cursor-not-allowed'
                  : 'bg-accent-500 hover:bg-accent-600 cursor-pointer'
                }
              `}
              title="Upload avatar"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {fullName}
                </h1>
                <div className={`flex flex-wrap items-center gap-4 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile?.email || 'No email'}</span>
                  </div>
                  {profile?.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{profile.phoneNumber}</span>
                    </div>
                  )}
                  {profile?.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{typeof profile.country === 'object' ? profile.country.name : profile.country}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-glow"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            </div>

            {/* Address */}
            {(profile?.address || profile?.city) && (
              <div className={`mt-4 flex items-start gap-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                <MapPin className="w-4 h-4 mt-0.5" />
                <span className="text-sm">
                  {[profile.address, profile.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {/* Join Date */}
            {profile?.createdAt && (
              <div className={`mt-2 flex items-center gap-2 text-xs ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stats Card Component - Reusable statistic display
 */
function StatsCard({ icon: Icon, label, value, color = 'primary' }) {
  const { isDark } = useTheme();

  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  };

  return (
    <div className={`
      p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02]
      ${isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{label}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Section Card Component - Container for profile sections
 */
function SectionCard({ icon: Icon, title, children, action, isRealData }) {
  const { isDark } = useTheme();

  return (
    <div className={`
      p-6 rounded-2xl border
      ${isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200 shadow-sm'
      }
    `}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
          <div className="flex items-center gap-3">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
            {isRealData !== undefined && <DataSourceIndicator isRealData={isRealData} />}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ icon: Icon, message, action }) {
  const { isDark } = useTheme();

  return (
    <div className="text-center py-12">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
        <Icon className={`w-8 h-8 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
      </div>
      <p className={`mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{message}</p>
      {action}
    </div>
  );
}

/**
 * Education Item Component - Enhanced UI with animations
 */
function EducationItem({ item, onEdit, onDelete }) {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`
        relative p-5 rounded-xl border-l-4 transition-all duration-300 ease-out
        ${isDark
          ? 'bg-gradient-to-r from-dark-700/80 to-dark-700/40 border-primary-500/50 hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/10'
          : 'bg-gradient-to-r from-white to-gray-50/50 border-primary-500 hover:border-primary-400 shadow-sm hover:shadow-md'
        }
        ${isHovered ? 'transform scale-[1.01]' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Icon */}
      <div className={`
        absolute -left-3 top-4 w-6 h-6 rounded-full flex items-center justify-center text-sm
        bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg
        transition-transform duration-300 ${isHovered ? 'scale-110' : ''}
      `}>
        🎓
      </div>

      <div className="flex items-start justify-between ml-2">
        <div className="flex-1">
          <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {item.degree}
          </h3>
          <p className="text-primary-400 font-medium text-sm mt-0.5">{item.institution}</p>
          <div className={`flex items-center gap-3 mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {item.startYear} - {item.endYear || 'Present'}
            </span>
            {item.gpa && (
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${isDark ? 'bg-accent-500/20 text-accent-400' : 'bg-accent-100 text-accent-700'}
              `}>
                GPA: {item.gpa}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Appear on hover */}
        <div className={`
          flex items-center gap-1 transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}>
          <button
            onClick={() => onEdit(item)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-primary-400 hover:bg-primary-500/10'
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }
            `}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }
            `}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Experience Item Component - Enhanced UI with timeline
 */
function ExperienceItem({ item, onEdit, onDelete }) {
  const { isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date for better display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div
      className={`
        relative p-5 rounded-xl border transition-all duration-300 ease-out group
        ${isDark
          ? 'bg-gradient-to-br from-dark-700/80 via-dark-700/60 to-dark-800/40 border-dark-600 hover:border-accent-500/50 hover:shadow-lg hover:shadow-accent-500/5'
          : 'bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 border-gray-200 hover:border-accent-400 shadow-sm hover:shadow-md'
        }
        ${isHovered ? 'transform scale-[1.01]' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline connector */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1 rounded-l-xl
        bg-gradient-to-b from-accent-500 via-accent-400 to-accent-600
        transition-all duration-300 ${isHovered ? 'w-1.5' : ''}
      `} />

      {/* Company Icon */}
      <div className={`
        absolute -left-3 top-5 w-6 h-6 rounded-full flex items-center justify-center text-sm
        bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg
        transition-transform duration-300 ${isHovered ? 'scale-110' : ''}
      `}>
        💼
      </div>

      <div className="flex items-start justify-between ml-3">
        <div className="flex-1">
          <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {item.title}
          </h3>
          <p className="text-accent-400 font-medium text-sm mt-0.5">{item.company}</p>

          <div className={`flex items-center gap-2 mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
              ${isDark ? 'bg-dark-600/50' : 'bg-gray-100'}
            `}>
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(item.startDate)} — {formatDate(item.endDate)}
            </span>
          </div>

          {item.description && (
            <div className="mt-3">
              <p className={`
                text-sm leading-relaxed
                ${isDark ? 'text-dark-300' : 'text-gray-600'}
                ${!isExpanded && item.description.length > 150 ? 'line-clamp-2' : ''}
              `}>
                {item.description}
              </p>
              {item.description.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-primary-400 hover:text-primary-300 mt-1 font-medium"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Appear on hover */}
        <div className={`
          flex items-center gap-1 transition-all duration-300
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}>
          <button
            onClick={() => onEdit(item)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-primary-400 hover:bg-primary-500/10'
                : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }
            `}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${isDark
                ? 'text-dark-400 hover:text-red-400 hover:bg-red-500/10'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }
            `}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Skill Tag Component - Enhanced with icons and category colors
 */
function SkillTag({ skill, onRemove, showIcon = true }) {
  const { isDark } = useTheme();
  const category = getSkillCategory(skill);

  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm border 
      transition-all duration-200 group hover:scale-105
      ${isDark
        ? `bg-gradient-to-r ${category.bgColor} ${category.borderColor} text-white/90 hover:shadow-lg`
        : `bg-gradient-to-r from-white to-gray-50 ${category.borderColor} text-gray-800 hover:shadow-md`
      }
    `}>
      {showIcon && (
        <SkillIcon skill={skill} size="w-4 h-4" />
      )}
      <span className="font-medium">{skill}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className={`
            w-5 h-5 rounded-full flex items-center justify-center 
            transition-all duration-200 opacity-60 group-hover:opacity-100
            ${isDark
              ? 'hover:bg-red-500/30 hover:text-red-300'
              : 'hover:bg-red-100 hover:text-red-600'
            }
          `}
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}

/**
 * Generic Modal Component using Headless Modal hook
 */
function Modal({ isOpen, onClose, title, children }) {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`
            rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in border
            max-h-[90vh] flex flex-col overflow-hidden
            ${isDark
              ? 'bg-dark-800 border-dark-700'
              : 'bg-white border-gray-200'
            }
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-5 border-b flex-shrink-0 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <button
              onClick={onClose}
              className={`transition-colors ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-5 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Profile Dashboard Page - Main Component
 */
export default function ProfileDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileFromApi, setIsProfileFromApi] = useState(false);
  const hasInitialized = useRef(false);

  // === HEADLESS UI HOOKS INTEGRATION ===

  // Education Modal - Using useHeadlessModal
  const educationModal = useHeadlessModal();

  // Experience Modal - Using useHeadlessModal
  const experienceModal = useHeadlessModal();

  // Skills Modal - Using useHeadlessModal
  const skillsModal = useHeadlessModal();

  // Education Data List - Using useHeadlessDataList
  const educationList = useHeadlessDataList({
    initialData: [],
    idKey: 'id'
  });

  // Experience Data List - Using useHeadlessDataList
  const experienceList = useHeadlessDataList({
    initialData: [],
    idKey: 'id'
  });

  // Skills state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [skillSaving, setSkillSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // For category filter
  const [customSkillIcons, setCustomSkillIcons] = useState(() => {
    // Load custom icons from localStorage
    const saved = localStorage.getItem('customSkillIcons');
    return saved ? JSON.parse(saved) : {};
  });
  const [iconPicker, setIconPicker] = useState({
    isOpen: false,
    skillName: '',
    pendingAdd: false
  });

  // Objective Summary state (Requirement 3.1.2)
  const [objectiveSummary, setObjectiveSummary] = useState('');
  const [isEditingObjective, setIsEditingObjective] = useState(false);
  const [tempObjective, setTempObjective] = useState('');
  const [savingObjective, setSavingObjective] = useState(false);

  // Avatar upload state (Requirement 3.2.1)
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Edit mode tracking for forms
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editingExperienceId, setEditingExperienceId] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: null, // 'education' | 'experience'
    id: null,
    title: '',
    message: '',
    loading: false
  });

  // Application stats (mock data - API not available)
  const [applications] = useState({ total: 12, pending: 5, accepted: 3, rejected: 4 });

  // Education Form using useHeadlessForm
  const educationForm = useHeadlessForm({
    initialValues: {
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      gpa: ''
    },
    validate: (values) => {
      const errors = {};
      if (!values.degree) errors.degree = 'Degree is required';
      if (!values.institution) errors.institution = 'Institution is required';
      if (!values.startYear) errors.startYear = 'Start year is required';
      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Map form values to API format
        const apiData = {
          degree: values.degree,
          institution: values.institution,
          fieldOfStudy: values.degree, // Use degree as field of study
          startDate: `${values.startYear}-01-01`,
          endDate: values.endYear ? `${values.endYear}-12-31` : null,
          current: !values.endYear,
          description: values.gpa ? `GPA: ${values.gpa}` : ''
        };

        if (editingEducationId) {
          // Update existing
          await ProfileService.updateEducation(editingEducationId, apiData);
          educationList.updateItem(editingEducationId, { ...values, id: editingEducationId });
          setEditingEducationId(null);
        } else {
          // Add new
          const response = await ProfileService.addEducation(apiData);
          const newEducation = {
            id: response?.id || Date.now().toString(),
            ...values
          };
          educationList.addItem(newEducation);
        }
        educationModal.close();
        educationForm.resetForm();
      } catch (error) {
        console.error('[ProfileDashboard] Error saving education:', error);
        alert('Failed to save education. Please try again.');
      }
    }
  });

  // Experience Form using useHeadlessForm
  const experienceForm = useHeadlessForm({
    initialValues: {
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    },
    validate: (values) => {
      const errors = {};
      if (!values.title) errors.title = 'Job title is required';
      if (!values.company) errors.company = 'Company is required';
      if (!values.startDate) errors.startDate = 'Start date is required';
      return errors;
    },
    onSubmit: async (values) => {
      try {
        // Map form values to API format
        const apiData = {
          position: values.title,
          company: values.company,
          startDate: values.startDate ? `${values.startDate}-01` : null,
          endDate: values.endDate ? `${values.endDate}-01` : null,
          current: !values.endDate,
          description: values.description || ''
        };

        if (editingExperienceId) {
          // Update existing
          await ProfileService.updateWorkExperience(editingExperienceId, apiData);
          experienceList.updateItem(editingExperienceId, { ...values, id: editingExperienceId });
          setEditingExperienceId(null);
        } else {
          // Add new
          const response = await ProfileService.addWorkExperience(apiData);
          const newExperience = {
            id: response?.id || Date.now().toString(),
            ...values
          };
          experienceList.addItem(newExperience);
        }
        experienceModal.close();
        experienceForm.resetForm();
      } catch (error) {
        console.error('[ProfileDashboard] Error saving experience:', error);
        alert('Failed to save experience. Please try again.');
      }
    }
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    // Prevent duplicate initialization
    if (hasInitialized.current) {
      setLoading(false);
      return;
    }

    // If no user, show mock profile data (for demo/testing)
    if (!currentUser) {
      hasInitialized.current = true;
      setProfile({
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@devision.com',
        country: 'Vietnam',
        phoneNumber: '+84 123 456 789',
        address: '702 Nguyễn Văn Linh',
        city: 'Ho Chi Minh City',
        createdAt: new Date().toISOString()
      });
      setIsProfileFromApi(false);

      // Add mock education/experience/skills
      educationList.addItem({
        id: '1',
        degree: 'Bachelor of Software Engineering (Hons)',
        institution: 'RMIT University Vietnam',
        startYear: '2021',
        endYear: '2025',
        gpa: '3.7'
      });
      educationList.addItem({
        id: '2',
        degree: 'High School Diploma',
        institution: 'Le Hong Phong High School',
        startYear: '2018',
        endYear: '2021',
        gpa: ''
      });
      experienceList.addItem({
        id: '1',
        title: 'Frontend Developer Intern',
        company: 'DEVision Technology',
        startDate: '2024-06',
        endDate: '',
        description: 'Building responsive web applications using React and Tailwind CSS. Contributing to UI component library development.'
      });
      experienceList.addItem({
        id: '2',
        title: 'Teaching Assistant',
        company: 'RMIT University',
        startDate: '2023-09',
        endDate: '2024-05',
        description: 'Assisted students in Web Programming course with HTML, CSS, JavaScript fundamentals.'
      });
      setSkills(['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python', 'Git', 'Docker']);
      setObjectiveSummary('Passionate software engineering student seeking challenging opportunities to apply my technical skills in real-world projects. Eager to learn and grow in a dynamic, innovative environment.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use /api/applicants/me endpoint for authenticated user
      let data;
      try {
        data = await ProfileService.getMyProfile();
        console.log('[ProfileDashboard] Loaded profile from /me:', data);
      } catch (meError) {
        console.warn('[ProfileDashboard] /me failed, trying legacy endpoint:', meError);
        // Fallback to legacy endpoint
        if (currentUser.userId) {
          data = await ProfileService.getProfileByUserId(currentUser.userId);
        } else {
          throw meError;
        }
      }

      if (data && data.id) {
        // Use normalized country fields
        const countryDisplay = data.countryName ||
          (typeof data.country === 'object' ? data.country?.displayName : data.country) ||
          'Not set';

        setProfile({
          ...data,
          email: currentUser.email,
          country: countryDisplay
        });
        setIsProfileFromApi(true);

        // Load education from API response - use setItems to replace entire list
        if (data.education && data.education.length > 0) {
          const mappedEducation = data.education.map(item => ({
            id: item.id,
            degree: item.degree,
            institution: item.institution,
            startYear: item.startDate ? new Date(item.startDate).getFullYear().toString() : '',
            endYear: item.current ? 'Current' : (item.endDate ? new Date(item.endDate).getFullYear().toString() : ''),
            // Parse GPA from gpa field, or extract from description (format: "GPA: X.XX")
            gpa: item.gpa || (item.description?.match(/GPA:\s*([\d.]+)/i)?.[1]) || ''
          }));
          educationList.setItems(mappedEducation);
        } else {
          educationList.setItems([]);
        }

        // Load work experience from API response - use setItems to replace entire list
        if (data.workExperience && data.workExperience.length > 0) {
          const mappedExperience = data.workExperience.map(item => ({
            id: item.id,
            title: item.position,
            company: item.company,
            startDate: item.startDate,
            endDate: item.current ? '' : item.endDate,
            description: item.description
          }));
          experienceList.setItems(mappedExperience);
        } else {
          experienceList.setItems([]);
        }

        // Load skills from API response
        if (data.skills && data.skills.length > 0) {
          setSkills(data.skills);
        }

        // Load objective summary
        if (data.objectiveSummary) {
          setObjectiveSummary(data.objectiveSummary);
        }
      } else {
        // Fallback to mock profile data
        setProfile({
          firstName: currentUser.firstName || 'Demo',
          lastName: currentUser.lastName || 'User',
          email: currentUser.email,
          country: 'Vietnam',
          createdAt: new Date().toISOString()
        });
        setIsProfileFromApi(false);

        // Add mock education/experience/skills data
        educationList.addItem({
          id: '1',
          degree: 'Bachelor of Software Engineering',
          institution: 'RMIT University Vietnam',
          startYear: '2021',
          endYear: '2025',
          gpa: '3.5'
        });
        experienceList.addItem({
          id: '1',
          title: 'Frontend Developer Intern',
          company: 'Tech Corp Vietnam',
          startDate: '2024-06',
          endDate: '',
          description: 'Developed responsive web applications using React and Tailwind CSS.'
        });
        setSkills(['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Node.js']);
      }
    } catch (err) {
      console.error('[ProfileDashboard] Error fetching profile:', err);
      // Fallback to mock data on error
      setProfile({
        firstName: currentUser?.firstName || 'Demo',
        lastName: currentUser?.lastName || 'User',
        email: currentUser?.email || 'user@example.com',
        country: 'Vietnam',
        createdAt: new Date().toISOString()
      });
      setIsProfileFromApi(false);
      setSkills(['React', 'JavaScript', 'Python']);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Track previous userId to detect user changes
  const prevUserIdRef = useRef(null);

  useEffect(() => {
    // Reset hasInitialized if userId changes (user logged in/out or switched)
    if (prevUserIdRef.current !== currentUser?.userId) {
      hasInitialized.current = false;
      // Clear existing data when user changes
      educationList.clearItems?.() || educationList.setItems?.([]);
      experienceList.clearItems?.() || experienceList.setItems?.([]);
      setSkills([]);
      prevUserIdRef.current = currentUser?.userId;
    }
    fetchProfile();
  }, [currentUser?.userId, fetchProfile]);

  // Add skill handler - calls API (accepts optional skillName for quick-add)
  // Check if skill is a known skill from our database
  const isKnownSkill = (name) => {
    const allSkills = Object.values(POPULAR_SKILLS).flat();
    return allSkills.some(s => s.name.toLowerCase() === name.toLowerCase());
  };

  // Actually add the skill (after icon is selected for custom skills)
  const confirmAddSkill = async (skillName, selectedIconKey = null) => {
    if (skillName && !skills.includes(skillName)) {
      setSkillSaving(true);
      try {
        // If custom icon was selected, save it
        if (selectedIconKey) {
          const updatedIcons = { ...customSkillIcons, [skillName.toLowerCase()]: selectedIconKey };
          setCustomSkillIcons(updatedIcons);
          localStorage.setItem('customSkillIcons', JSON.stringify(updatedIcons));
        }
        await ProfileService.addSkill(skillName);
        setSkills([...skills, skillName]);
        setNewSkill('');
        setIconPicker({ isOpen: false, skillName: '', pendingAdd: false });
      } catch (error) {
        console.error('[ProfileDashboard] Error adding skill:', error);
        alert('Failed to add skill. Please try again.');
      } finally {
        setSkillSaving(false);
      }
    }
  };

  const handleAddSkill = async (skillName = null) => {
    const trimmedSkill = skillName ? skillName.trim() : newSkill.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      // Check if it's a known skill
      if (isKnownSkill(trimmedSkill)) {
        // Known skill - add directly
        await confirmAddSkill(trimmedSkill);
      } else {
        // Custom skill - show icon picker
        setIconPicker({
          isOpen: true,
          skillName: trimmedSkill,
          pendingAdd: true
        });
      }
    }
  };

  // Remove skill handler - calls API
  const handleRemoveSkill = async (skillToRemove) => {
    try {
      await ProfileService.deleteSkill(skillToRemove);
      setSkills(skills.filter(s => s !== skillToRemove));
    } catch (error) {
      console.error('[ProfileDashboard] Error removing skill:', error);
      alert('Failed to remove skill. Please try again.');
    }
  };

  // Delete education handler - opens custom dialog
  const handleDeleteEducation = (id) => {
    const item = educationList.items.find(e => e.id === id);
    setDeleteDialog({
      isOpen: true,
      type: 'education',
      id,
      title: 'Delete Education',
      message: `Are you sure you want to delete "${item?.degree || 'this education'}" from ${item?.institution || 'your profile'}? This action cannot be undone.`,
      loading: false
    });
  };

  // Delete experience handler - opens custom dialog
  const handleDeleteExperience = (id) => {
    const item = experienceList.items.find(e => e.id === id);
    setDeleteDialog({
      isOpen: true,
      type: 'experience',
      id,
      title: 'Delete Work Experience',
      message: `Are you sure you want to delete "${item?.title || 'this position'}" at ${item?.company || 'this company'}? This action cannot be undone.`,
      loading: false
    });
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      if (deleteDialog.type === 'education') {
        await ProfileService.deleteEducation(deleteDialog.id);
        educationList.removeItem(deleteDialog.id);
      } else if (deleteDialog.type === 'experience') {
        await ProfileService.deleteWorkExperience(deleteDialog.id);
        experienceList.removeItem(deleteDialog.id);
      }
      setDeleteDialog({ isOpen: false, type: null, id: null, title: '', message: '', loading: false });
    } catch (error) {
      console.error(`[ProfileDashboard] Error deleting ${deleteDialog.type}:`, error);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
      alert(`Failed to delete ${deleteDialog.type}. Please try again.`);
    }
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    if (!deleteDialog.loading) {
      setDeleteDialog({ isOpen: false, type: null, id: null, title: '', message: '', loading: false });
    }
  };

  // Avatar upload handler (Requirement 3.2.1)
  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await ProfileService.uploadMyAvatar(file);
      // Update profile with new avatar URL
      setProfile(prev => ({ ...prev, avatarUrl: response?.avatarUrl || response }));
      alert('Avatar uploaded successfully!');
    } catch (error) {
      console.error('[ProfileDashboard] Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-dark-400' : 'text-gray-500'}>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`p-8 max-w-md rounded-2xl border ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'}`}>
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Error Loading Profile</h3>
            <p className={`mb-4 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{error}</p>
            <button
              onClick={fetchProfile}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Objective Summary handlers
  const handleEditObjective = () => {
    setTempObjective(objectiveSummary);
    setIsEditingObjective(true);
  };

  const handleSaveObjective = async () => {
    setSavingObjective(true);
    try {
      await ProfileService.updateMyProfile({ objectiveSummary: tempObjective });
      setObjectiveSummary(tempObjective);
      setIsEditingObjective(false);
    } catch (error) {
      console.error('[ProfileDashboard] Error saving objective:', error);
      alert('Failed to save objective summary. Please try again.');
    } finally {
      setSavingObjective(false);
    }
  };

  const handleCancelObjective = () => {
    setIsEditingObjective(false);
    setTempObjective('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        onEdit={() => navigate('/dashboard/profile/edit')}
        isRealData={isProfileFromApi}
        onAvatarUpload={handleAvatarUpload}
        uploadingAvatar={uploadingAvatar}
        avatarInputRef={avatarInputRef}
      />

      {/* Objective Summary Section (Requirement 3.1.2) */}
      <div className={`
        p-6 rounded-2xl border
        ${isDark
          ? 'bg-dark-800 border-dark-700'
          : 'bg-white border-gray-200 shadow-sm'
        }
      `}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent-400" />
            </div>
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Objective Summary</h2>
              <DataSourceIndicator isRealData={false} />
            </div>
          </div>
          {!isEditingObjective && (
            <button
              onClick={handleEditObjective}
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditingObjective ? (
          <div className="space-y-4">
            <textarea
              value={tempObjective}
              onChange={(e) => setTempObjective(e.target.value)}
              placeholder="Write a brief summary of your career objectives..."
              rows={4}
              className={`
                w-full px-4 py-3 rounded-xl border transition-colors resize-none
                ${isDark
                  ? 'bg-dark-700 border-dark-600 text-white placeholder:text-dark-500 focus:border-primary-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary-500'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500/20
              `}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancelObjective}
                className={`px-4 py-2 rounded-lg transition-colors ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveObjective}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className={`leading-relaxed ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
            {objectiveSummary || (
              <span className={isDark ? 'text-dark-500 italic' : 'text-gray-400 italic'}>
                No objective summary yet. Click "Edit" to add one.
              </span>
            )}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-4">
        <DataSourceIndicator isRealData={false} className="mb-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FileText}
          label="Applications"
          value={applications.total}
          color="primary"
        />
        <StatsCard
          icon={Clock}
          label="Pending"
          value={applications.pending}
          color="amber"
        />
        <StatsCard
          icon={CheckCircle}
          label="Accepted"
          value={applications.accepted}
          color="green"
        />
        <StatsCard
          icon={TrendingUp}
          label="Profile Views"
          value="84"
          color="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Education Section */}
          <SectionCard
            icon={GraduationCap}
            title="Education"
            isRealData={isProfileFromApi}
            action={
              <button
                onClick={educationModal.open}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            }
          >
            {educationList.items.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                message="No education history added yet"
                action={
                  <button
                    onClick={educationModal.open}
                    className="btn-secondary"
                  >
                    Add Education
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {educationList.items.map((item) => (
                  <EducationItem
                    key={item.id}
                    item={item}
                    onEdit={(item) => {
                      setEditingEducationId(item.id);
                      educationForm.setValues(item);
                      educationModal.open();
                    }}
                    onDelete={handleDeleteEducation}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Experience Section */}
          <SectionCard
            icon={Briefcase}
            title="Work Experience"
            isRealData={isProfileFromApi}
            action={
              <button
                onClick={experienceModal.open}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            }
          >
            {experienceList.items.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                message="No work experience added yet"
                action={
                  <button
                    onClick={experienceModal.open}
                    className="btn-secondary"
                  >
                    Add Experience
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {experienceList.items.map((item) => (
                  <ExperienceItem
                    key={item.id}
                    item={item}
                    onEdit={(item) => {
                      setEditingExperienceId(item.id);
                      experienceForm.setValues(item);
                      experienceModal.open();
                    }}
                    onDelete={handleDeleteExperience}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Section */}
          <SectionCard
            icon={Code}
            title="Skills"
            isRealData={isProfileFromApi}
            action={
              <button
                onClick={skillsModal.open}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            }
          >
            {skills.length === 0 ? (
              <EmptyState
                icon={Code}
                message="No skills added yet"
                action={
                  <button
                    onClick={skillsModal.open}
                    className="btn-secondary btn-sm"
                  >
                    Add Skills
                  </button>
                }
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillTag
                    key={skill}
                    skill={skill}
                    onRemove={handleRemoveSkill}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Portfolio Section */}
          <SectionCard
            icon={Award}
            title="Portfolio"
            isRealData={false}
            action={
              <button className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                <Plus className="w-4 h-4" />
                Upload
              </button>
            }
          >
            <EmptyState
              icon={Award}
              message="No portfolio items yet"
              action={
                <button className="btn-secondary btn-sm">
                  Upload Portfolio
                </button>
              }
            />
          </SectionCard>

          {/* Quick Links */}
          <div className={`
            p-6 rounded-2xl border
            ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          `}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDark ? 'text-dark-300' : 'text-gray-500'}`}>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isDark
                    ? 'bg-dark-700/50 hover:bg-dark-700 text-dark-300 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Briefcase className="w-5 h-5" />
                <span>Find Jobs</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => navigate('/dashboard/applications')}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isDark
                    ? 'bg-dark-700/50 hover:bg-dark-700 text-dark-300 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <FileText className="w-5 h-5" />
                <span>My Applications</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* === MODALS using Headless Modal Hook === */}

      {/* Education Modal */}
      <Modal
        isOpen={educationModal.isOpen}
        onClose={educationModal.close}
        title="Add Education"
      >
        <form onSubmit={educationForm.handleSubmit} className="space-y-4">
          <FormInput
            label="Degree"
            name="degree"
            placeholder="Bachelor of Software Engineering"
            value={educationForm.values.degree}
            onChange={educationForm.handleChange}
            onBlur={educationForm.handleBlur}
            error={educationForm.touched.degree && educationForm.errors.degree}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <FormInput
            label="Institution"
            name="institution"
            placeholder="RMIT University"
            value={educationForm.values.institution}
            onChange={educationForm.handleChange}
            onBlur={educationForm.handleBlur}
            error={educationForm.touched.institution && educationForm.errors.institution}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Year"
              name="startYear"
              type="number"
              placeholder="2020"
              value={educationForm.values.startYear}
              onChange={educationForm.handleChange}
              onBlur={educationForm.handleBlur}
              error={educationForm.touched.startYear && educationForm.errors.startYear}
              required
              variant={isDark ? 'dark' : 'light'}
            />
            <FormInput
              label="End Year"
              name="endYear"
              type="number"
              placeholder="2024 or leave empty"
              value={educationForm.values.endYear}
              onChange={educationForm.handleChange}
              onBlur={educationForm.handleBlur}
              variant={isDark ? 'dark' : 'light'}
            />
          </div>
          <FormInput
            label="GPA (optional)"
            name="gpa"
            type="number"
            step="0.1"
            placeholder="3.5"
            value={educationForm.values.gpa}
            onChange={educationForm.handleChange}
            variant={isDark ? 'dark' : 'light'}
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={educationModal.close}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={educationForm.isSubmitting}
            >
              {educationForm.isSubmitting ? 'Saving...' : 'Save Education'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Experience Modal */}
      <Modal
        isOpen={experienceModal.isOpen}
        onClose={experienceModal.close}
        title="Add Work Experience"
      >
        <form onSubmit={experienceForm.handleSubmit} className="space-y-4">
          <FormInput
            label="Job Title"
            name="title"
            placeholder="Software Engineer"
            value={experienceForm.values.title}
            onChange={experienceForm.handleChange}
            onBlur={experienceForm.handleBlur}
            error={experienceForm.touched.title && experienceForm.errors.title}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <FormInput
            label="Company"
            name="company"
            placeholder="Google, VNG, FPT..."
            value={experienceForm.values.company}
            onChange={experienceForm.handleChange}
            onBlur={experienceForm.handleBlur}
            error={experienceForm.touched.company && experienceForm.errors.company}
            required
            variant={isDark ? 'dark' : 'light'}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              name="startDate"
              type="month"
              value={experienceForm.values.startDate}
              onChange={experienceForm.handleChange}
              onBlur={experienceForm.handleBlur}
              error={experienceForm.touched.startDate && experienceForm.errors.startDate}
              required
              variant={isDark ? 'dark' : 'light'}
            />
            <FormInput
              label="End Date"
              name="endDate"
              type="month"
              value={experienceForm.values.endDate}
              onChange={experienceForm.handleChange}
              variant={isDark ? 'dark' : 'light'}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe your responsibilities and achievements..."
              value={experienceForm.values.description}
              onChange={experienceForm.handleChange}
              className={`
                w-full px-4 py-3 border rounded-lg resize-none transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${isDark
                  ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }
              `}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={experienceModal.close}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={experienceForm.isSubmitting}
            >
              {experienceForm.isSubmitting ? 'Saving...' : 'Save Experience'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Skills Modal - Enhanced with categories and smart suggestions */}
      <Modal
        isOpen={skillsModal.isOpen}
        onClose={skillsModal.close}
        title="Manage Skills"
      >
        <div className="space-y-5">
          {/* Custom Skill Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type to search or add custom skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className={`
                  w-full px-4 py-3 border rounded-xl transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${isDark
                    ? 'bg-dark-700 border-dark-600 text-white placeholder-dark-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  }
                `}
              />
              {/* Search suggestions dropdown */}
              {newSkill.trim() && searchSkills(newSkill).length > 0 && (
                <div className={`
                  absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden
                  ${isDark ? 'bg-dark-700 border-dark-600' : 'bg-white border-gray-200'}
                `}>
                  {searchSkills(newSkill).filter(s => !skills.includes(s.name)).slice(0, 5).map(suggestion => (
                    <button
                      key={suggestion.name}
                      onClick={() => {
                        if (!skills.includes(suggestion.name)) {
                          handleAddSkill(suggestion.name);
                          setNewSkill('');
                        }
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isDark
                          ? 'hover:bg-dark-600 text-white'
                          : 'hover:bg-gray-50 text-gray-900'
                        }
                      `}
                    >
                      <SkillIcon skill={suggestion.name} size="w-5 h-5" />
                      <span className="font-medium">{suggestion.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleAddSkill()}
              disabled={skillSaving || !newSkill.trim()}
              className={`
                px-5 py-3 rounded-xl font-medium transition-all duration-200
                ${skillSaving || !newSkill.trim()
                  ? 'bg-dark-600 text-dark-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-lg hover:scale-105'
                }
              `}
            >
              {skillSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick Add Popular Skills */}
          <div>
            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
              🔥 Quick Add Popular Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {getQuickAddSkills().filter(s => !skills.includes(s.name)).slice(0, 8).map(skill => (
                <button
                  key={skill.name}
                  onClick={() => handleAddSkill(skill.name)}
                  className={`
                    inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium
                    transition-all duration-200 hover:scale-105 hover:shadow-md
                    ${isDark
                      ? 'bg-dark-700/50 border-dark-600 text-dark-200 hover:border-primary-500/50 hover:bg-primary-500/10'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                    }
                  `}
                >
                  <SkillIcon skill={skill.name} size="w-4 h-4" />
                  <span>{skill.name}</span>
                  <Plus className="w-3.5 h-3.5 text-primary-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs with Skills - Redesigned */}
          <div>
            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
              📂 Browse by Category
            </p>
            <div className={`
              rounded-2xl border overflow-hidden shadow-sm
              ${isDark ? 'bg-dark-700/30 border-dark-600' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'}
            `}>
              {/* Category pills - Clickable filters */}
              <div className={`flex flex-wrap gap-2 p-4 border-b ${isDark ? 'border-dark-600' : 'border-gray-100'}`}>
                {/* All category button */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`
                    inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                    transition-all duration-200 hover:scale-105
                    ${selectedCategory === 'all'
                      ? (isDark
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30')
                      : (isDark
                        ? 'bg-dark-600/50 text-dark-300 hover:bg-dark-500/50'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300')
                    }
                  `}
                >
                  ✨ All
                </button>
                {Object.entries(SKILL_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`
                      inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 hover:scale-105
                      ${selectedCategory === key
                        ? (isDark
                          ? `bg-gradient-to-r ${cat.bgColor} text-white shadow-lg`
                          : `bg-gradient-to-r ${cat.bgColor} text-white shadow-lg`)
                        : (isDark
                          ? 'bg-dark-600/50 text-dark-300 hover:bg-dark-500/50'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300')
                      }
                    `}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* Skills grid - Filtered by category */}
              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {(selectedCategory === 'all'
                    ? Object.values(POPULAR_SKILLS).flat()
                    : POPULAR_SKILLS[selectedCategory] || []
                  ).filter(s => !skills.includes(s.name)).map(skill => (
                    <button
                      key={skill.name}
                      onClick={() => handleAddSkill(skill.name)}
                      className={`
                        inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium
                        transition-all duration-200 hover:scale-105 hover:shadow-md
                        ${isDark
                          ? 'bg-dark-600/50 text-dark-200 hover:bg-primary-500/20 hover:text-primary-300 border border-dark-500/50'
                          : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-700 border border-gray-200 hover:border-primary-300'
                        }
                      `}
                    >
                      <SkillIcon skill={skill.name} size="w-4 h-4" />
                      <span>{skill.name}</span>
                      <Plus className="w-3 h-3 opacity-50" />
                    </button>
                  ))}
                  {(selectedCategory === 'all'
                    ? Object.values(POPULAR_SKILLS).flat()
                    : POPULAR_SKILLS[selectedCategory] || []
                  ).filter(s => !skills.includes(s.name)).length === 0 && (
                      <p className={`text-sm italic ${isDark ? 'text-dark-400' : 'text-gray-400'}`}>
                        All skills from this category have been added! 🎉
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Skills */}
          {skills.length > 0 && (
            <div className={`pt-4 border-t ${isDark ? 'border-dark-600' : 'border-gray-200'}`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                ✨ Your Skills ({skills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillTag
                    key={skill}
                    skill={skill}
                    onRemove={handleRemoveSkill}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={skillsModal.close}
              className={`
                px-6 py-2.5 rounded-xl font-medium transition-all duration-200
                bg-gradient-to-r from-primary-500 to-primary-600 text-white
                hover:shadow-lg hover:scale-105
              `}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>

      {/* Icon Picker Modal for Custom Skills */}
      {iconPicker.isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-fade-in"
            onClick={() => setIconPicker({ isOpen: false, skillName: '', pendingAdd: false })}
          />
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div
              className={`
                rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border
                max-h-[80vh] flex flex-col overflow-hidden
                ${isDark
                  ? 'bg-dark-800 border-dark-700'
                  : 'bg-white border-gray-200'
                }
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b flex-shrink-0 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Choose Icon for "{iconPicker.skillName}"
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                    Select an icon that represents this skill
                  </p>
                </div>
                <button
                  onClick={() => setIconPicker({ isOpen: false, skillName: '', pendingAdd: false })}
                  className={`p-2 rounded-xl transition-colors ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-600' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Icon Grid */}
              <div className="p-5 overflow-y-auto flex-1">
                <div className="grid grid-cols-6 gap-3">
                  {Object.entries(SKILL_ICONS).filter(([key]) => key !== 'default').map(([key, icon]) => (
                    <button
                      key={key}
                      onClick={() => confirmAddSkill(iconPicker.skillName, key)}
                      disabled={skillSaving}
                      className={`
                        p-3 rounded-xl border-2 transition-all duration-200
                        hover:scale-110 hover:shadow-lg
                        ${isDark
                          ? 'bg-dark-700 border-dark-600 hover:border-primary-500 hover:bg-primary-500/20'
                          : 'bg-gray-50 border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                        }
                        ${skillSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      title={key}
                    >
                      <span className="w-6 h-6 block">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-between p-4 border-t flex-shrink-0 ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => confirmAddSkill(iconPicker.skillName, 'default')}
                  disabled={skillSaving}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${isDark ? 'text-dark-300 hover:text-white hover:bg-dark-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                    ${skillSaving ? 'opacity-50' : ''}
                  `}
                >
                  {skillSaving ? 'Adding...' : 'Use Default Icon'}
                </button>
                <button
                  onClick={() => setIconPicker({ isOpen: false, skillName: '', pendingAdd: false })}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium
                    ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.title}
        message={deleteDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteDialog.loading}
      />
    </div>
  );
}
