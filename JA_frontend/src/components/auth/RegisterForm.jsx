/**
 * Registration Form Component
 * Level Ultimo: Full validation, SSO, country dropdown
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses Headless UI Form component
 * - Form logic handled by headless useForm hook  
 * - Validation, touched state, submission managed by hook
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Building2, AlertCircle, Loader2, Clock, RefreshCw } from 'lucide-react';
import { SSOButtonsGroup, OrDivider } from './SSOButtons';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { FormInput } from '../reusable/FormInput';
import CountrySelect from '../reusable/CountrySelect';
import PhoneInput from '../reusable/PhoneInput';
import { useForm } from '../headless/form';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/AuthService';

/**
 * Validate registration form values
 */
const validateRegistrationForm = (values) => {
  const errors = {};

  // Email validation
  const emailErrors = validateEmail(values.email || '');
  if (emailErrors.length > 0) {
    errors.email = emailErrors[0].message;
  }

  // Password validation
  const passwordErrors = validatePassword(values.password || '');
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors[0].message;
  }

  // Confirm password validation
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Country validation (required)
  if (!values.country) {
    errors.country = 'Country is required';
  }

  // Phone validation (optional but must be valid if provided)
  if (values.phoneNumber) {
    const phoneErrors = validatePhone(values.phoneNumber);
    if (phoneErrors.length > 0) {
      errors.phoneNumber = phoneErrors[0].message;
    }
  }

  return errors;
};

/**
 * Registration Form using Headless UI Form component
 */
export default function RegisterForm({ onSuccess, onLoginClick }) {
  const { register, getCountries } = useAuth();

  // UI state separate from form
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Resend activation state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState(null);

  // Handle registration submission
  const handleRegisterSubmit = async (values) => {
    setSubmitError('');

    try {
      const result = await register({
        email: values.email,
        password: values.password,
        country: values.country,
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        phoneNumber: values.phoneNumber || undefined,
        city: values.city || undefined,
        address: values.address || undefined,
      });

      if (result.success) {
        setSubmitSuccess(true);
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        setSubmitError(result.message || 'Registration failed');
        throw new Error(result.message);
      }
    } catch (err) {
      if (!submitError) {
        setSubmitError(err.message || 'An unexpected error occurred');
      }
      throw err;
    }
  };

  // Use headless form hook
  const form = useForm({
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
    validate: validateRegistrationForm,
    onSubmit: handleRegisterSubmit,
    validateOnBlur: true,
    validateOnChange: false,
  });

  // CountrySelect component handles country loading internally

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle SSO success
  const handleSSOSuccess = (result) => {
    if (onSuccess) {
      onSuccess(result);
    }
  };

  // Handle SSO error
  const handleSSOError = (error) => {
    setSubmitError(error.message || 'Google sign-up failed');
  };

  // Handle resend activation email
  const handleResendActivation = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendMessage('');

    try {
      const result = await authService.resendActivationEmail(form.values.email);

      if (result.success) {
        if (result.alreadyActivated) {
          setResendMessage({ type: 'success', text: '✅ Account already activated! You can login now.' });
        } else {
          setResendMessage({ type: 'success', text: '✅ New activation link sent! Check your email.' });
          setResendCooldown(60);
        }
      } else if (result.rateLimited) {
        setResendCooldown(result.retryAfter || 60);
        setResendMessage({ type: 'warning', text: `⏳ Please wait ${result.retryAfter || 60}s before trying again.` });
      } else {
        setResendMessage({ type: 'error', text: '❌ ' + (result.message || 'Failed to send email.') });
      }
    } catch (error) {
      console.error('Resend activation error:', error);
      setResendMessage({ type: 'error', text: '❌ Failed to send activation email. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  // Success message with resend functionality
  if (submitSuccess) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-500/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
        <p className="text-dark-300 mb-6">
          We've sent an activation link to <span className="text-white font-medium">{form.values.email}</span>
        </p>

        <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-dark-400 mb-3">
            Didn't receive the email? Check your spam folder or:
          </p>
          <button
            onClick={handleResendActivation}
            disabled={resendCooldown > 0 || resendLoading}
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
          >
            {resendLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Wait {resendCooldown}s</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Resend activation email</span>
              </>
            )}
          </button>

          {resendMessage && (
            <p className={`mt-3 text-sm ${resendMessage.type === 'success' ? 'text-green-400' :
              resendMessage.type === 'warning' ? 'text-amber-400' : 'text-red-400'
              }`}>
              {resendMessage.text}
            </p>
          )}
        </div>

        <button
          onClick={onLoginClick}
          className="text-primary-400 hover:text-primary-300 transition-colors text-sm"
        >
          Already activated? Sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6" noValidate>
      {/* SSO Buttons - Using Google Identity Services */}
      <SSOButtonsGroup
        onSuccess={handleSSOSuccess}
        onError={handleSSOError}
        disabled={form.isSubmitting}
      />

      <OrDivider />

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="firstName"
          type="text"
          value={form.values.firstName}
          onChange={form.handleChange}
          icon={User}
          placeholder="Trường"
          autoComplete="given-name"
          variant="dark"
        />
        <FormInput
          label="Last Name"
          name="lastName"
          type="text"
          value={form.values.lastName}
          onChange={form.handleChange}
          placeholder="Trần"
          autoComplete="family-name"
          variant="dark"
        />
      </div>

      {/* Email - Using headless form state */}
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.touched.email && form.errors.email}
        icon={Mail}
        placeholder="nguyen.an@gmail.com"
        required
        autoComplete="email"
        variant="dark"
      />

      {/* Password */}
      <div>
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.touched.password && form.errors.password}
          icon={Lock}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          variant="dark"
        />
        <PasswordStrengthMeter password={form.values.password} />
      </div>

      {/* Confirm Password */}
      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={form.values.confirmPassword}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.touched.confirmPassword && form.errors.confirmPassword}
        icon={Lock}
        placeholder="••••••••"
        required
        autoComplete="new-password"
        variant="dark"
      />

      {/* Country - Using CountrySelect with headless form state */}
      <CountrySelect
        label="Country"
        name="country"
        value={form.values.country}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.touched.country && form.errors.country}
        placeholder="Select your country"
        required
        variant="dark"
      />

      {/* Phone Number (Optional) */}
      <PhoneInput
        label="Phone Number"
        name="phoneNumber"
        value={form.values.phoneNumber}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        error={form.touched.phoneNumber && form.errors.phoneNumber}
        placeholder="Enter phone number"
        defaultCountry="VN"
        variant="dark"
      />

      {/* City & Address (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="City"
          name="city"
          type="text"
          value={form.values.city}
          onChange={form.handleChange}
          icon={Building2}
          placeholder="Hồ Chí Minh"
          autoComplete="address-level2"
          variant="dark"
        />
        <FormInput
          label="Address"
          name="address"
          type="text"
          value={form.values.address}
          onChange={form.handleChange}
          placeholder="123 Đường Lê Lợi"
          autoComplete="street-address"
          variant="dark"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={form.isSubmitting}
        className="btn-primary w-full h-12 text-base"
      >
        {form.isSubmitting ? (
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
