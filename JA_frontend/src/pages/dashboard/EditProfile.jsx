/**
 * Edit Profile Page
 * 
 * Allows users to edit their profile information with validation
 * 
 * Architecture:
 * - A.3.a: Uses useHeadlessForm for form state management
 * - A.2.a: Uses reusable FormInput components
 * - Full client-side validation
 * - Responsive layout
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, X, Loader2, AlertCircle, ArrowLeft,
  User, Mail, Phone, MapPin, Building2
} from 'lucide-react';
import { ProfileService } from '../../services/ProfileService';
import { useAuth } from '../../hooks/useAuth';
import useHeadlessForm from '../../components/headless/HeadlessForm';
import { FormInput, FormSelect, Card } from '../../components/reusable';
import { validateEmail, validatePhone } from '../../utils/validators/authValidators';

/**
 * Validation function for profile form
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

  // Country validation (required)
  if (!values.country) {
    errors.country = 'Country is required';
  }

  // Phone validation (optional, but if provided must be valid)
  if (values.phoneNumber) {
    const phoneErrors = validatePhone(values.phoneNumber);
    if (phoneErrors.length > 0) {
      errors.phoneNumber = phoneErrors[0].message;
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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch profile and countries on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, countriesData] = await Promise.all([
          ProfileService.getProfileByUserId(currentUser.userId),
          fetch('http://localhost:8080/api/countries').then(res => res.json()).catch(() => [])
        ]);
        
        setProfile(profileData);
        setCountries(countriesData.map(c => ({ 
          value: c.code || c.name, 
          label: c.name 
        })));
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.userId) {
      fetchData();
    }
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
        await ProfileService.updateProfile(profile.id, formValues);
        setSaveSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/profile');
        }, 1500);
        return { success: true };
      } catch (err) {
        throw new Error(err.message || 'Failed to update profile');
      }
    },
  });

  // Set form values when profile loads
  useEffect(() => {
    if (profile) {
      setValues({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        country: profile.country || '',
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
          <p className="text-dark-400">Loading profile...</p>
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
          className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Profile</h1>
        <p className="text-dark-400 mt-2">Update your personal information</p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Profile updated successfully!</p>
            <p className="text-sm text-green-400/70 mt-1">Redirecting to profile...</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card variant="dark" className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
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
                placeholder="Trường"
                variant="dark"
              />
              <FormInput
                label="Last Name"
                name="lastName"
                type="text"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName && errors.lastName}
                placeholder="Trần"
                variant="dark"
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
              variant="dark"
            />
            <p className="text-xs text-dark-500 -mt-2">
              Email cannot be changed. Contact support if you need to update it.
            </p>

            {/* Country */}
            <FormSelect
              label="Country"
              name="country"
              value={values.country}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.country && errors.country}
              options={countries}
              icon={MapPin}
              placeholder="Select your country"
              required
              variant="dark"
            />
          </div>
        </Card>

        {/* Contact Information */}
        <Card variant="dark" className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary-400" />
            Contact Information
          </h2>

          <div className="space-y-4">
            {/* Phone */}
            <FormInput
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={values.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phoneNumber && errors.phoneNumber}
              icon={Phone}
              placeholder="+84 123 456 789"
              variant="dark"
            />

            {/* Address */}
            <FormInput
              label="Address"
              name="address"
              type="text"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.address && errors.address}
              icon={MapPin}
              placeholder="123 Đường Lê Lợi"
              variant="dark"
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
              placeholder="Hồ Chí Minh"
              variant="dark"
            />
          </div>
        </Card>

        {/* Submit Error */}
        {submitError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/profile')}
            className="btn-secondary"
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

