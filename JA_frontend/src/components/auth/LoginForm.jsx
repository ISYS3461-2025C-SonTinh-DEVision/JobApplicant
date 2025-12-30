/**
 * Login Form Component
 * Level Ultimo: Full validation, SSO, remember me, brute force protection feedback
 * 
 * Architecture Note: Uses reusable FormInput component from components/reusable/
 * following requirement A.2.a (Medium Frontend) - common display elements as configurable components
 */

import React, { useState, useCallback } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { SSOButtonsGroup, OrDivider } from './SSOButtons';
import { FormInput } from '../reusable/FormInput';
import { validateEmail } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';

/**
 * Login Form
 */
export default function LoginForm({ onSuccess, onRegisterClick, onForgotPasswordClick }) {
  const { login } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockCountdown, setBlockCountdown] = useState(0);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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
        if (!formData.password) {
          fieldErrors = [{ field: 'password', message: 'Password is required' }];
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
    const emailErrors = validateEmail(formData.email);
    const errorMap = {};

    emailErrors.forEach(({ field, message }) => {
      errorMap[field] = message;
    });

    if (!formData.password) {
      errorMap.password = 'Password is required';
    }

    setErrors(errorMap);
    return Object.keys(errorMap).length === 0;
  }, [formData]);

  // Start block countdown
  const startBlockCountdown = useCallback((seconds) => {
    setIsBlocked(true);
    setBlockCountdown(seconds);

    const interval = setInterval(() => {
      setBlockCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsBlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      return;
    }

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        // Check if account is blocked due to brute force protection
        if (result.message?.includes('blocked') || result.message?.includes('Too many')) {
          startBlockCountdown(60);
          setSubmitError('Too many failed login attempts. Please wait 60 seconds before trying again.');
        } else {
          setSubmitError(result.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      // Handle brute force protection error
      if (err.status === 429) {
        startBlockCountdown(60);
        setSubmitError('Too many failed login attempts. Please wait before trying again.');
      } else {
        setSubmitError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle SSO success - navigate to dashboard
  const handleSSOSuccess = (result) => {
    if (onSuccess) {
      onSuccess(result);
    }
  };

  // Handle SSO error
  const handleSSOError = (error) => {
    setSubmitError(error.message || 'Google login failed');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* SSO Buttons - Using Google Identity Services */}
      <SSOButtonsGroup
        onSuccess={handleSSOSuccess}
        onError={handleSSOError}
        disabled={isSubmitting || isBlocked}
      />

      <OrDivider />

      {/* Submit Error */}
      {submitError && (
        <div className={`p-4 rounded-xl flex items-start gap-3 animate-shake ${isBlocked
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
          {isBlocked ? (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="text-sm">{submitError}</p>
            {isBlocked && blockCountdown > 0 && (
              <p className="text-xs font-mono">
                Try again in: {blockCountdown}s
              </p>
            )}
          </div>
        </div>
      )}

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
        disabled={isBlocked}
        autoComplete="email"
        variant="dark"
      />

      {/* Password */}
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
        disabled={isBlocked}
        autoComplete="current-password"
        variant="dark"
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="checkbox-custom"
          />
          <span className="text-sm text-dark-300 group-hover:text-white transition-colors">
            Remember me
          </span>
        </label>
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="text-sm link"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || isBlocked}
        className="btn-primary w-full h-12 text-base"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Signing in...
          </>
        ) : isBlocked ? (
          <>
            <ShieldAlert className="w-5 h-5 mr-2" />
            Blocked ({blockCountdown}s)
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {/* Register Link */}
      <p className="text-center text-dark-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onRegisterClick}
          className="link font-medium"
        >
          Create account
        </button>
      </p>
    </form>
  );
}

