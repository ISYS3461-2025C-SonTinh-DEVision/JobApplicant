/**
 * Registration Form Component
 * Level Ultimo: Full validation, SSO, country dropdown
 * 
 * Architecture Note: Uses reusable FormInput/FormSelect components from components/reusable/
 * following requirement A.2.a (Medium Frontend) - common display elements as configurable components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Lock, User, Phone, MapPin, Building2, AlertCircle, Loader2, Clock, RefreshCw } from 'lucide-react';
import { SSOButtonsGroup, OrDivider } from './SSOButtons';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { FormInput, FormSelect } from '../reusable/FormInput';
import { validateEmail, validatePassword, validatePhone, validateRegister } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/AuthService';

/**
 * Registration Form
 */
export default function RegisterForm({ onSuccess, onLoginClick }) {
  const { register, loginWithGoogle, getCountries } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    city: '',
    address: '',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [ssoLoading, setSsoLoading] = useState(null);

  // Resend activation state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState(null);

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

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);


  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  }, [errors]);

  // Handle blur for validation
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate single field
    let fieldErrors = [];

    switch (name) {
      case 'email':
        fieldErrors = validateEmail(formData.email);
        break;
      case 'password':
        fieldErrors = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        if (formData.confirmPassword !== formData.password) {
          fieldErrors = [{ field: 'confirmPassword', message: 'Passwords do not match' }];
        }
        break;
      case 'phoneNumber':
        if (formData.phoneNumber) {
          fieldErrors = validatePhone(formData.phoneNumber);
        }
        break;
      case 'country':
        if (!formData.country) {
          fieldErrors = [{ field: 'country', message: 'Country is required' }];
        }
        break;
      default:
        break;
    }

    if (fieldErrors.length > 0) {
      setErrors((prev) => ({ ...prev, [name]: fieldErrors[0].message }));
    }
  }, [formData]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const validationErrors = validateRegister({
      email: formData.email,
      password: formData.password,
      phone: formData.phoneNumber,
      country: formData.country,
    });

    const errorMap = {};
    validationErrors.forEach(({ field, message }) => {
      errorMap[field] = message;
    });

    // Check confirm password
    if (formData.confirmPassword !== formData.password) {
      errorMap.confirmPassword = 'Passwords do not match';
    }

    setErrors(errorMap);
    return Object.keys(errorMap).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      country: true,
      phoneNumber: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        country: formData.country,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        city: formData.city || undefined,
        address: formData.address || undefined,
      });

      if (result.success) {
        setSubmitSuccess(true);
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        setSubmitError(result.message || 'Registration failed');
      }
    } catch (err) {
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google SSO
  const handleGoogleLogin = () => {
    setSsoLoading('google');
    loginWithGoogle();
  };

  // Handle resend activation email
  const handleResendActivation = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendMessage('');

    try {
      const result = await authService.resendActivationEmail(formData.email);

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
          We've sent an activation link to <span className="text-white font-medium">{formData.email}</span>
        </p>

        {/* Resend section */}
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

          {/* Resend message */}
          {resendMessage && (
            <p className={`mt-3 text-sm ${resendMessage.type === 'success' ? 'text-green-400' :
              resendMessage.type === 'warning' ? 'text-amber-400' : 'text-red-400'
              }`}>
              {resendMessage.text}
            </p>
          )}
        </div>

        {/* Login link */}
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

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="firstName"
          type="text"
          value={formData.firstName}
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
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Trần"
          autoComplete="family-name"
          variant="dark"
        />
      </div>

      {/* Email */}
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && errors.email}
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
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          icon={Lock}
          placeholder="••••••••"
          required
          autoComplete="new-password"
          variant="dark"
        />
        <PasswordStrengthMeter password={formData.password} />
      </div>

      {/* Confirm Password */}
      <FormInput
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.confirmPassword && errors.confirmPassword}
        icon={Lock}
        placeholder="••••••••"
        required
        autoComplete="new-password"
        variant="dark"
      />

      {/* Country */}
      <FormSelect
        label="Country"
        name="country"
        value={formData.country}
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

      {/* Phone Number (Optional) */}
      <FormInput
        label="Phone Number"
        name="phoneNumber"
        type="tel"
        value={formData.phoneNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phoneNumber && errors.phoneNumber}
        icon={Phone}
        placeholder="+84 123 456 789"
        autoComplete="tel"
        variant="dark"
      />

      {/* City & Address (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="City"
          name="city"
          type="text"
          value={formData.city}
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
          value={formData.address}
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

