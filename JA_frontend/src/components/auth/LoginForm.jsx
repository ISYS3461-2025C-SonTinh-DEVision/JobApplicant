/**
 * Login Form Component
 * Level Ultimo: Full validation, SSO, remember me, brute force protection feedback
 * 
 * Architecture Notes:
 * - Uses reusable FormInput component (A.2.a - Componentized Frontend)
 * - Uses Headless Form hook (A.3.a - Headless UI) for form logic separation
 */

import React, { useState, useCallback } from 'react';
import { Mail, Lock, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { SSOButtonsGroup, OrDivider } from './SSOButtons';
import { FormInput } from '../reusable/FormInput';
import { validateEmail } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';
import useHeadlessForm from '../headless/HeadlessForm';

/**
 * Validation function for login form
 */
const validateLoginForm = (values) => {
  const errors = {};
  
  // Email validation
  const emailErrors = validateEmail(values.email);
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
 * Login Form - Uses Headless Form Pattern
 */
export default function LoginForm({ onSuccess, onRegisterClick, onForgotPasswordClick }) {
  const { login, loginWithGoogle } = useAuth();

  // Brute force protection state (not part of form logic)
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockCountdown, setBlockCountdown] = useState(0);
  const [ssoLoading, setSsoLoading] = useState(null);

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
    setFieldValue,
  } = useHeadlessForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: validateLoginForm,
    onSubmit: async (formValues) => {
      if (isBlocked) {
        throw new Error('Account temporarily blocked');
      }

      const result = await login({
        email: formValues.email,
        password: formValues.password,
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
        }
        throw new Error(result.message || 'Invalid email or password');
      }
    },
  });

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

  // Handle form submission with brute force handling
  const onFormSubmit = async (e) => {
    try {
      await handleSubmit(e);
    } catch (err) {
      // Handle brute force protection error
      if (err.status === 429) {
        startBlockCountdown(60);
      }
    }
  };

  // Handle checkbox change (special case)
  const handleCheckboxChange = (e) => {
    setFieldValue('rememberMe', e.target.checked);
  };

  // Handle Google SSO
  const handleGoogleLogin = () => {
    setSsoLoading('google');
    loginWithGoogle();
  };

  // Determine error message to display
  const displayError = submitError || (isBlocked ? 'Too many failed login attempts. Please wait before trying again.' : '');

  return (
    <form onSubmit={onFormSubmit} className="space-y-6" noValidate>
      {/* SSO Buttons */}
      <SSOButtonsGroup
        onGoogleClick={handleGoogleLogin}
        disabled={isSubmitting || isBlocked}
        loading={ssoLoading}
      />

      <OrDivider />

      {/* Submit Error */}
      {displayError && (
        <div className={`p-4 rounded-xl flex items-start gap-3 animate-shake ${
          isBlocked 
            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {isBlocked ? (
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="text-sm">{displayError}</p>
            {isBlocked && blockCountdown > 0 && (
              <p className="text-xs font-mono">
                Try again in: {blockCountdown}s
              </p>
            )}
          </div>
        </div>
      )}

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
        disabled={isBlocked}
        autoComplete="email"
        variant="dark"
      />

      {/* Password - Using Headless Form values */}
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
            checked={values.rememberMe}
            onChange={handleCheckboxChange}
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
