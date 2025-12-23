/**
 * Registration Form Component
 * Level Ultimo: Full validation, SSO, country dropdown
 * 
 * Architecture Note: Uses reusable FormInput/FormSelect components from components/reusable/
 * following requirement A.2.a (Medium Frontend) - common display elements as configurable components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Lock, User, Phone, MapPin, Building2, AlertCircle, Loader2, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { SSOButtonsGroup, OrDivider } from './SSOButtons';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { FormInput, FormSelect } from '../reusable/FormInput';
import { validateEmail, validatePassword, validatePhone, validateRegister } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

/**
 * Success message component with resend activation email functionality
 * Includes 60-second cooldown timer to prevent spam
 */
function SuccessWithResend({ email, onLoginClick }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(c => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Handle resend activation email
  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendMessage('');
    setResendSuccess(false);

    try {
      const result = await authService.resendActivationEmail(email);

      if (result.success) {
        if (result.alreadyActivated) {
          setResendMessage('Your account is already activated! You can login now.');
          setResendSuccess(true);
        } else {
          setResendMessage('A new activation link has been sent to your email!');
          setResendSuccess(true);
          setCooldown(60); // Start 60 second cooldown
        }
      } else if (result.rateLimited) {
        setCooldown(result.retryAfter || 60);
        setResendMessage(`Please wait ${result.retryAfter || 60} seconds before requesting again.`);
      } else {
        setResendMessage(result.message || 'Failed to send activation email.');
      }
    } catch (error) {
      console.error('Resend activation error:', error);
      setResendMessage('Failed to send activation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="text-center py-6 animate-fade-in">
      {/* Success Icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-500/20 flex items-center justify-center">
        <Mail className="w-8 h-8 text-accent-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>

      {/* Description */}
      <p className="text-dark-300 mb-6">
        We've sent an activation link to{' '}
        <span className="text-white font-medium">{email}</span>
      </p>

      {/* Resend Section */}
      <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
        <p className="text-sm text-dark-400 mb-3">
          Didn't receive the email? Check your spam folder or click below to resend.
        </p>

        <button
          onClick={handleResend}
          disabled={resendLoading || cooldown > 0}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
            ${cooldown > 0
              ? 'bg-dark-600 text-dark-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-500 text-white'
            }
            disabled:opacity-60`}
        >
          {resendLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : cooldown > 0 ? (
            <>
              <Clock className="w-4 h-4" />
              <span>Wait {cooldown}s</span>
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              <span>Resend Activation Email</span>
            </>
          )}
        </button>

        {/* Resend Feedback Message */}
        {resendMessage && (
          <p className={`mt-3 text-sm flex items-center justify-center gap-1.5 ${resendSuccess ? 'text-green-400' : 'text-amber-400'
            }`}>
            {resendSuccess && <CheckCircle2 className="w-4 h-4" />}
            {resendMessage}
          </p>
        )}
      </div>

      {/* Login Button */}
      <button
        onClick={onLoginClick}
        className="btn-secondary w-full inline-flex items-center justify-center gap-2"
      >
        <span>Go to Login</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}


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

  // Success message with resend functionality
  if (submitSuccess) {
    return (
      <SuccessWithResend
        email={formData.email}
        onLoginClick={onLoginClick}
      />
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

