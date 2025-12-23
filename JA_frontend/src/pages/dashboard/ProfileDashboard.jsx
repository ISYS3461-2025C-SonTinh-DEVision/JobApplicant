/**
 * Profile Dashboard Page
 * 
 * Displays complete user profile with all sections:
 * - Basic Info
 * - Education History
 * - Work Experience  
 * - Technical Skills
 * - Portfolio
 * - Application Statistics
 * 
 * Architecture:
 * - A.3.a (Ultimo): Uses Headless UI hooks for modal, tabs, form, and data management
 * - A.2.a: Uses reusable UI components
 * - Responsive design for mobile/desktop
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Calendar, Edit, Loader2,
  Briefcase, GraduationCap, Code, Award, FileText, TrendingUp,
  CheckCircle, Clock, XCircle, AlertCircle, Plus, Trash2, ExternalLink
} from 'lucide-react';
import ProfileService from '../../services/ProfileService';
import { useAuth } from '../../hooks/useAuth';

import {
  useHeadlessModal,
  useHeadlessForm,
  useHeadlessDataList
} from '../../components/headless';

// Import Reusable Components
import { Card, FormInput } from '../../components/reusable';

/**
 * Profile Header Section with Avatar and Basic Info
 */
function ProfileHeader({ profile, onEdit }) {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'No name set';
  const initial = (fullName[0] || 'U').toUpperCase();

  return (
    <Card variant="dark" className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
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
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent-500 border-4 border-dark-800 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-dark-300">
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
                      <span className="text-sm">{profile.country}</span>
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
              <div className="mt-4 flex items-start gap-2 text-dark-400">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span className="text-sm">
                  {[profile.address, profile.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            {/* Join Date */}
            {profile?.createdAt && (
              <div className="mt-2 flex items-center gap-2 text-dark-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Stats Card Component - Reusable statistic display
 */
function StatsCard({ icon: Icon, label, value, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  };

  return (
    <Card variant="dark" className="p-6 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-dark-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Section Card Component - Container for profile sections
 */
function SectionCard({ icon: Icon, title, children, action }) {
  return (
    <Card variant="dark" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ icon: Icon, message, action }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
        <Icon className="w-8 h-8 text-dark-400" />
      </div>
      <p className="text-dark-400 mb-4">{message}</p>
      {action}
    </div>
  );
}

/**
 * Education Item Component
 */
function EducationItem({ item, onEdit, onDelete }) {
  return (
    <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600 hover:border-primary-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{item.degree}</h3>
          <p className="text-primary-400 text-sm">{item.institution}</p>
          <p className="text-dark-400 text-xs mt-1">
            {item.startYear} - {item.endYear || 'Present'}
            {item.gpa && <span className="ml-2">• GPA: {item.gpa}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-dark-400 hover:text-primary-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Experience Item Component
 */
function ExperienceItem({ item, onEdit, onDelete }) {
  return (
    <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600 hover:border-primary-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{item.title}</h3>
          <p className="text-primary-400 text-sm">{item.company}</p>
          <p className="text-dark-400 text-xs mt-1">
            {item.startDate} - {item.endDate || 'Present'}
          </p>
          {item.description && (
            <p className="text-dark-300 text-sm mt-2">{item.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 text-dark-400 hover:text-primary-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Skill Tag Component
 */
function SkillTag({ skill, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/20 text-primary-300 text-sm border border-primary-500/30 hover:border-primary-400 transition-colors group">
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary-500/30 transition-colors"
        >
          <XCircle className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

/**
 * Generic Modal Component using Headless Modal hook
 */
function Modal({ isOpen, onClose, title, children }) {
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
          className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-700">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-dark-400 hover:text-white transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Note: useHeadlessTabs is available for future tab-based UI
  // Currently using grid layout instead

  // Skills state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Application stats (mock data - will be replaced with real API)
  const [applications] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });

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
      const newEducation = {
        id: Date.now().toString(),
        ...values
      };
      educationList.addItem(newEducation);
      educationModal.close();
      educationForm.resetForm();
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
      const newExperience = {
        id: Date.now().toString(),
        ...values
      };
      experienceList.addItem(newExperience);
      experienceModal.close();
      experienceForm.resetForm();
    }
  });

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    if (!currentUser?.userId) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profileService = new ProfileService();
      const data = await profileService.getProfileByUserId(currentUser.userId);
      setProfile({ ...data, email: currentUser.email });

      // Load education, experience, skills from profile if available
      if (data.education) {
        data.education.forEach(item => educationList.addItem(item));
      }
      if (data.experience) {
        data.experience.forEach(item => experienceList.addItem(item));
      }
      if (data.skills) {
        setSkills(data.skills);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Add skill handler
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Remove skill handler
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card variant="dark" className="p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Profile</h3>
            <p className="text-dark-400 mb-4">{error}</p>
            <button
              onClick={fetchProfile}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        onEdit={() => navigate('/dashboard/profile/edit')}
      />

      {/* Stats Grid */}
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
          value="24"
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
                      educationForm.setValues(item);
                      educationModal.open();
                    }}
                    onDelete={educationList.removeItem}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Experience Section */}
          <SectionCard
            icon={Briefcase}
            title="Work Experience"
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
                      experienceForm.setValues(item);
                      experienceModal.open();
                    }}
                    onDelete={experienceList.removeItem}
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
          <Card variant="dark" className="p-6">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
              >
                <Briefcase className="w-5 h-5" />
                <span>Find Jobs</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </button>
              <button
                onClick={() => navigate('/dashboard/applications')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>My Applications</span>
                <ExternalLink className="w-4 h-4 ml-auto" />
              </button>
            </div>
          </Card>
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
            variant="dark"
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
            variant="dark"
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
              variant="dark"
            />
            <FormInput
              label="End Year"
              name="endYear"
              type="number"
              placeholder="2024 or leave empty"
              value={educationForm.values.endYear}
              onChange={educationForm.handleChange}
              onBlur={educationForm.handleBlur}
              variant="dark"
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
            variant="dark"
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
            variant="dark"
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
            variant="dark"
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
              variant="dark"
            />
            <FormInput
              label="End Date"
              name="endDate"
              type="month"
              value={experienceForm.values.endDate}
              onChange={experienceForm.handleChange}
              variant="dark"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Describe your responsibilities and achievements..."
              value={experienceForm.values.description}
              onChange={experienceForm.handleChange}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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

      {/* Skills Modal */}
      <Modal
        isOpen={skillsModal.isOpen}
        onClose={skillsModal.close}
        title="Add Skills"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a skill (e.g., React, Python...)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-primary px-4"
            >
              Add
            </button>
          </div>

          {skills.length > 0 && (
            <div className="pt-4 border-t border-dark-700">
              <p className="text-sm text-dark-400 mb-3">Current Skills:</p>
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

          <div className="pt-4">
            <p className="text-xs text-dark-500">
              Popular skills: React, Node.js, Python, Java, TypeScript, Docker, AWS, MongoDB
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={skillsModal.close}
              className="btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
