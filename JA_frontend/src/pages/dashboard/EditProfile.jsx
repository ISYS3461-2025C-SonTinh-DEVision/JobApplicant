/**
 * Edit Profile Page
 * 
 * Allows users to edit their profile information with validation
 * 
 * Architecture:
 * - A.3.a: Uses useHeadlessForm for form state management
 * - A.2.a: Uses reusable FormInput, CountrySelect, PhoneInput components
 * - Full client-side validation matching project requirements
 * - Light/Dark mode support via ThemeContext
 * - Responsive layout
 * 
 * Validation Requirements:
 * - Country: Required (1.1.1)
 * - Phone: Optional, but if provided must be valid format (1.2.3)
 * - Address, City: Optional text fields
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, X, Loader2, AlertCircle, ArrowLeft, CheckCircle,
  User, Mail, Building2
} from 'lucide-react';
import ProfileService from '../../services/ProfileService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import useHeadlessForm from '../../components/headless/HeadlessForm';
import { FormInput, Card, PhoneInput, CountrySelect } from '../../components/reusable';

/**
 * Validation function for profile form
 * Matches project requirements for profile management
 */
const validateProfileForm = (values) => {
  const errors = {};

  // First name validation (optional)
  if (values.firstName && values.firstName.length > 50) {
    errors.firstName = 'First name must be less than 50 characters';
  }

  // Last name validation (optional)
  if (values.lastName && values.lastName.length > 50) {
    errors.lastName = 'Last name must be less than 50 characters';
  }

  // Country validation (required - Requirement 1.1.1)
  if (!values.country) {
    errors.country = 'Country is required';
  }

  // Phone validation (optional, but if provided must be valid - Requirement 1.2.3)
  if (values.phoneNumber) {
    // Must start with + and dial code
    if (!values.phoneNumber.startsWith('+')) {
      errors.phoneNumber = 'Phone number must include country dial code (e.g., +84)';
    } else {
      // Extract digits after +
      const digits = values.phoneNumber.replace(/\D/g, '');
      if (digits.length > 15) {
        errors.phoneNumber = 'Phone number is too long (max 15 digits)';
      }
      if (digits.length < 7) {
        errors.phoneNumber = 'Phone number is too short (min 7 digits)';
      }
    }
  }

  // Address validation (optional)
  if (values.address && values.address.length > 200) {
    errors.address = 'Address must be less than 200 characters';
  }

  // City validation (optional)
  if (values.city && values.city.length > 100) {
    errors.city = 'City must be less than 100 characters';
  }

  return errors;
};

/**
 * Edit Profile Page
 */
export default function EditProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Try to fetch real profile using /api/applicants/me
        if (currentUser) {
          try {
            const profileData = await ProfileService.getMyProfile();
            console.log('[EditProfile] Loaded profile:', profileData);
            setProfile(profileData);
          } catch (apiError) {
            console.warn('[EditProfile] API error, trying fallback:', apiError);
            // Try legacy endpoint if /me fails
            if (currentUser.userId) {
              const profileData = await ProfileService.getProfileByUserId(currentUser.userId);
              setProfile(ProfileService.normalizeProfile ? ProfileService.normalizeProfile(profileData) : profileData);
            } else {
              throw apiError;
            }
          }
        } else {
          // Mock profile for demo mode (no auth)
          setProfile({
            id: 'demo',
            firstName: 'Demo',
            lastName: 'User',
            countryCode: 'VN',
            phoneNumber: '+84123456789',
            address: '702 Nguyễn Văn Linh',
            city: 'Ho Chi Minh City',
          });
        }
      } catch (err) {
        console.error('[EditProfile] Error loading data:', err);
        // Fallback to mock profile
        setProfile({
          id: 'demo',
          firstName: 'Demo',
          lastName: 'User',
          countryCode: 'VN',
          phoneNumber: '',
          address: '',
          city: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Headless form for profile editing
  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
  } = useHeadlessForm({
    initialValues: {
      firstName: '',
      lastName: '',
      country: '',
      phoneNumber: '',
      address: '',
      city: '',
    },
    validate: validateProfileForm,
    onSubmit: async (formValues) => {
      try {
        // Use /api/applicants/me for authenticated user
        if (currentUser) {
          await ProfileService.updateMyProfile(formValues);
        } else {
          // Fallback to legacy endpoint for demo
          await ProfileService.updateProfile(profile.id, formValues);
        }
        setSaveSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/profile');
        }, 1500);
        return { success: true };
      } catch (err) {
        console.error('[EditProfile] Save error:', err);
        throw new Error(err.message || 'Failed to update profile');
      }
    },
  });

  // Set form values when profile loads
  useEffect(() => {
    if (profile) {
      // Use countryCode from normalized profile, fallback to extracting from country object
      const countryValue = profile.countryCode
        || (typeof profile.country === 'object' ? profile.country?.code : profile.country)
        || '';

      console.log('[EditProfile] Setting form values, country:', countryValue, 'phone:', profile.phoneNumber);

      setValues({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        country: countryValue,
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        city: profile.city || '',
      });
    }
  }, [profile, setValues]);

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/profile')}
          className={`flex items-center gap-2 transition-colors mb-4 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>
        <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h1>
        <p className={`mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Update your personal information</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className={`
          mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in
          ${isDark
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-green-50 border border-green-200 text-green-700'
          }
        `}>
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Profile updated successfully!</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-green-400/70' : 'text-green-600'}`}>Redirecting to profile...</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className={`
          p-6 rounded-2xl border
          ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
        `}>
          <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <User className="w-5 h-5 text-primary-400" />
            Basic Information
          </h2>

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                name="firstName"
                type="text"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName && errors.firstName}
                icon={User}
                placeholder="Your first name"
                variant={isDark ? 'dark' : 'light'}
              />
              <FormInput
                label="Last Name"
                name="lastName"
                type="text"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && errors.lastName}
                placeholder="Your last name"
                variant={isDark ? 'dark' : 'light'}
              />
            </div>

            {/* Email (Read-only) */}
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={currentUser?.email || ''}
              icon={Mail}
              disabled
              variant={isDark ? 'dark' : 'light'}
            />
            <p className={`text-xs -mt-2 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
              To change your email or password, visit{' '}
              <button
                type="button"
                onClick={() => navigate('/dashboard/security')}
                className="text-primary-400 hover:text-primary-300 underline"
              >
                Security Settings
              </button>
            </p>

            {/* Country - Using new CountrySelect component */}
            <CountrySelect
              label="Country"
              name="country"
              value={values.country}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.country && errors.country}
              placeholder="Select your country"
              required
              variant={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className={`
          p-6 rounded-2xl border
          ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
        `}>
          <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Building2 className="w-5 h-5 text-primary-400" />
            Contact Information
          </h2>

          <div className="space-y-4">
            {/* Phone - Using new PhoneInput component */}
            <PhoneInput
              label="Phone Number"
              name="phoneNumber"
              value={values.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phoneNumber && errors.phoneNumber}
              placeholder="Enter phone number"
              defaultCountry="VN"
              variant={isDark ? 'dark' : 'light'}
            />

            {/* Address */}
            <FormInput
              label="Street Address"
              name="address"
              type="text"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.address && errors.address}
              placeholder="Your street address"
              variant={isDark ? 'dark' : 'light'}
            />

            {/* City */}
            <FormInput
              label="City"
              name="city"
              type="text"
              value={values.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.city && errors.city}
              icon={Building2}
              placeholder="Your city"
              variant={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className={`
            p-4 rounded-xl flex items-start gap-3 animate-shake
            ${isDark
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-red-50 border border-red-200 text-red-700'
            }
          `}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/profile')}
            className={`
              inline-flex items-center px-6 py-3 rounded-xl font-medium transition-colors
              ${isDark
                ? 'bg-dark-700 text-white hover:bg-dark-600 border border-dark-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }
            `}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || saveSuccess}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
