/**
 * Registration Form Component
 * Level Ultimo: Full validation, SSO, country dropdown
 * 
 * Architecture Notes:
 * - Uses reusable FormInput/FormSelect components (A.2.a - Componentized Frontend)
 * - Uses Headless Form hook (A.3.a - Headless UI) for form logic separation
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Phone, MapPin, Building2, AlertCircle, Loader2 } from 'lucide-react';
import { SSOButtonsGroup, OrDivider } from './SSOButtons';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { FormInput, FormSelect } from '../reusable/FormInput';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';
import useHeadlessForm from '../headless/HeadlessForm';

/**
 * Validation function for register form
 */
const validateRegisterForm = (values) => {
  const errors = {};
  
  // Email validation
  const emailErrors = validateEmail(values.email);
  if (emailErrors.length > 0) {
    errors.email = emailErrors[0].message;
  }
  
  // Password validation
  const passwordErrors = validatePassword(values.password);
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors[0].message;
  }
  
  // Confirm password validation
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Country validation
  if (!values.country) {
    errors.country = 'Country is required';
  }
  
  // Phone validation (optional)
  if (values.phoneNumber) {
    const phoneErrors = validatePhone(values.phoneNumber);
    if (phoneErrors.length > 0) {
      errors.phoneNumber = phoneErrors[0].message;
    }
  }
  
  return errors;
};

/**
 * Registration Form - Uses Headless Form Pattern
 */
export default function RegisterForm({ onSuccess, onLoginClick }) {
  const { register, loginWithGoogle, getCountries } = useAuth();

  // Countries and SSO state (not part of form logic)
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [ssoLoading, setSsoLoading] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Use Headless Form hook for form state management
  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useHeadlessForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      country: '',
      city: '',
      address: '',
    },
    validate: validateRegisterForm,
    onSubmit: async (formValues) => {
      const result = await register({
        email: formValues.email,
        password: formValues.password,
        country: formValues.country,
        firstName: formValues.firstName || undefined,
        lastName: formValues.lastName || undefined,
        phoneNumber: formValues.phoneNumber || undefined,
        city: formValues.city || undefined,
        address: formValues.address || undefined,
      });
      
      if (result.success) {
        setSubmitSuccess(true);
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    },
  });

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (err) {
        console.error('Failed to load countries:', err);
        // Set default countries
        setCountries([
          { value: 'VIETNAM', label: 'Vietnam', code: 'VN' },
          { value: 'SINGAPORE', label: 'Singapore', code: 'SG' },
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, [getCountries]);

  // Handle Google SSO
  const handleGoogleLogin = () => {
    setSsoLoading('google');
    loginWithGoogle();
  };

  // Success message
  if (submitSuccess) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-500/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
        <p className="text-dark-300 mb-6">
          We've sent an activation link to <span className="text-white font-medium">{values.email}</span>
        </p>
        <p className="text-sm text-dark-400">
          Didn't receive the email? Check your spam folder or{' '}
          <button className="link">resend activation email</button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* SSO Buttons */}
      <SSOButtonsGroup
        onGoogleClick={handleGoogleLogin}
        disabled={isSubmitting}
        loading={ssoLoading}
      />

      <OrDivider />

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* Name Fields - Using Headless Form values */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="firstName"
          type="text"
          value={values.firstName}
          onChange={handleChange}
          icon={User}
          placeholder="Trường"
          autoComplete="given-name"
          variant="dark"
        />
        <FormInput
          label="Last Name"
          name="lastName"
          type="text"
          value={values.lastName}
          onChange={handleChange}
          placeholder="Trần"
          autoComplete="family-name"
          variant="dark"
        />
      </div>

      {/* Email - Using Headless Form values */}
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && errors.email}
        icon={Mail}
        placeholder="nguyen.an@gmail.com"
        required
        autoComplete="email"
        variant="dark"
      />

      {/* Password - Using Headless Form values */}
      <div>
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          icon={Lock}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          variant="dark"
        />
        <PasswordStrengthMeter password={values.password} />
      </div>

      {/* Confirm Password - Using Headless Form values */}
      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword && errors.confirmPassword}
        icon={Lock}
        placeholder="••••••••"
        required
        autoComplete="new-password"
        variant="dark"
      />

      {/* Country - Using Headless Form values */}
      <FormSelect
        label="Country"
        name="country"
        value={values.country}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.country && errors.country}
        icon={MapPin}
        options={countries}
        placeholder="Select your country"
        required
        disabled={loadingCountries}
        variant="dark"
      />

      {/* Phone Number (Optional) - Using Headless Form values */}
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
        autoComplete="tel"
        variant="dark"
      />

      {/* City & Address (Optional) - Using Headless Form values */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="City"
          name="city"
          type="text"
          value={values.city}
          onChange={handleChange}
          icon={Building2}
          placeholder="Hồ Chí Minh"
          autoComplete="address-level2"
          variant="dark"
        />
        <FormInput
          label="Address"
          name="address"
          type="text"
          value={values.address}
          onChange={handleChange}
          placeholder="123 Đường Lê Lợi"
          autoComplete="street-address"
          variant="dark"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full h-12 text-base"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Login Link */}
      <p className="text-center text-dark-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onLoginClick}
          className="link font-medium"
        >
          Sign in
        </button>
      </p>

      {/* Terms */}
      <p className="text-xs text-dark-500 text-center">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="link">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="link">Privacy Policy</a>
      </p>
    </form>
  );
}
