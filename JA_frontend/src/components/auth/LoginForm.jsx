/**
 * Login Form Component
 * Level Ultimo: Full validation, SSO, remember me, brute force protection feedback
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Uses Headless UI Form component
 * - Form logic handled by headless useForm hook
 * - Styled using headless Form compound components
 */

import React, { useState, useCallback } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { SSOButtonsGroup, OrDivider } from './SSOButtons';
import { useForm } from '../headless/form';
import { FormInput } from '../reusable/FormInput';
import { validateEmail } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';

/**
 * Validate login form values
 */
const validateLoginForm = (values) => {
  const errors = {};

  // Email validation
  const emailErrors = validateEmail(values.email || '');
  if (emailErrors.length > 0) {
    errors.email = emailErrors[0].message;
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
};

/**
 * Login Form using Headless UI Form component
 */
export default function LoginForm({ onSuccess, onRegisterClick, onForgotPasswordClick }) {
  const { login } = useAuth();

  // Brute force protection state (kept separate from form state)
  const [submitError, setSubmitError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockCountdown, setBlockCountdown] = useState(0);

  // Start block countdown for brute force protection
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

  // Handle form submission using headless form
  const handleLoginSubmit = async (values) => {
    if (isBlocked) {
      throw new Error('Account is temporarily blocked');
    }

    setSubmitError('');

    try {
      const result = await login({
        email: values.email,
        password: values.password,
      });

      if (result.success) {
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } else {
        // Check if account is blocked due to brute force protection
        if (result.message?.includes('blocked') || result.message?.includes('Too many')) {
          startBlockCountdown(60);
          setSubmitError('Too many failed login attempts. Please wait 60 seconds before trying again.');
        } else {
          setSubmitError(result.message || 'Invalid email or password');
        }
        throw new Error(result.message);
      }
    } catch (err) {
      // Handle brute force protection error
      if (err.status === 429) {
        startBlockCountdown(60);
        setSubmitError('Too many failed login attempts. Please wait before trying again.');
      } else if (!submitError) {
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
      rememberMe: false,
    },
    validate: validateLoginForm,
    onSubmit: handleLoginSubmit,
    validateOnBlur: true,
    validateOnChange: false,
  });

  // Handle SSO success
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
    <form onSubmit={form.handleSubmit} className="space-y-6" noValidate>
      {/* SSO Buttons - Using Google Identity Services */}
      <SSOButtonsGroup
        onSuccess={handleSSOSuccess}
        onError={handleSSOError}
        disabled={form.isSubmitting || isBlocked}
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
        disabled={isBlocked}
        autoComplete="email"
        variant="dark"
      />

      {/* Password - Using headless form state */}
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
            checked={form.values.rememberMe}
            onChange={form.handleChange}
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
        disabled={form.isSubmitting || isBlocked}
        className="btn-primary w-full h-12 text-base"
      >
        {form.isSubmitting ? (
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
