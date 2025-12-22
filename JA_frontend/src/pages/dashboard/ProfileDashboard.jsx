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
 * - A.3.a: Uses Headless hooks for modal and data management
 * - A.2.a: Uses reusable UI components
 * - Responsive design for mobile/desktop
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Loader2,
  Briefcase, GraduationCap, Code, Award, FileText, TrendingUp,
  CheckCircle, Clock, XCircle, AlertCircle
} from 'lucide-react';
import { ProfileService } from '../../services/ProfileService';
import { useAuth } from '../../hooks/useAuth';
import useHeadlessModal from '../../components/headless/HeadlessModal';
import { Card } from '../../components/reusable';

/**
 * Profile Header Section
 */
function ProfileHeader({ profile, onEdit }) {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || 'No name';
  const initial = fullName[0].toUpperCase();

  return (
    <Card variant="dark" className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-20" />
      
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-2xl">
              {initial}
            </div>
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
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-lg"
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
 * Stats Card Component
 */
function StatsCard({ icon: Icon, label, value, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/20 text-primary-400',
    accent: 'from-accent-500/20 to-accent-600/20 text-accent-400',
    green: 'from-green-500/20 to-green-600/20 text-green-400',
    amber: 'from-amber-500/20 to-amber-600/20 text-amber-400',
  };

  return (
    <Card variant="dark" className="p-6">
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
 * Section Card Component
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
 * Profile Dashboard Page
 */
export default function ProfileDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for sections not yet in backend
  const [education] = useState([]);
  const [experience] = useState([]);
  const [skills] = useState([]);
  const [applications] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser?.userId) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ProfileService.getProfileByUserId(currentUser.userId);
      setProfile({ ...data, email: currentUser.email }); // Add email from auth context
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                + Add Education
              </button>
            }
          >
            {education.length === 0 ? (
              <EmptyState 
                icon={GraduationCap}
                message="No education history added yet"
                action={
                  <button className="btn-secondary">
                    Add Education
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {/* Education items will go here */}
              </div>
            )}
          </SectionCard>

          {/* Experience Section */}
          <SectionCard 
            icon={Briefcase} 
            title="Work Experience"
            action={
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                + Add Experience
              </button>
            }
          >
            {experience.length === 0 ? (
              <EmptyState 
                icon={Briefcase}
                message="No work experience added yet"
                action={
                  <button className="btn-secondary">
                    Add Experience
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {/* Experience items will go here */}
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
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                + Add Skill
              </button>
            }
          >
            {skills.length === 0 ? (
              <EmptyState 
                icon={Code}
                message="No skills added yet"
                action={
                  <button className="btn-secondary btn-sm">
                    Add Skills
                  </button>
                }
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {/* Skills tags will go here */}
              </div>
            )}
          </SectionCard>

          {/* Portfolio Section */}
          <SectionCard 
            icon={Award} 
            title="Portfolio"
            action={
              <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                + Upload
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
        </div>
      </div>
    </div>
  );
}

