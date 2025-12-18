/**
 * Reset Password Page
 * Set new password using token from email
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Briefcase, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { validatePassword } from '../../utils/validators/authValidators';
import PasswordStrengthMeter from '../../components/auth/PasswordStrengthMeter';
import { useAuth } from '../../context/AuthContext';

// Background component
function BackgroundShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="bg-shape w-96 h-96 bg-primary-600/20 -top-20 -left-20" style={{ animationDelay: '0s' }} />
      <div className="bg-shape w-80 h-80 bg-accent-500/15 bottom-1/4 -right-20" style={{ animationDelay: '2s' }} />
    </div>
  );
}

// Logo component
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
        <Briefcase className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-white">DEVision</span>
    </Link>
  );
}

// Password input component
function PasswordInput({ label, name, value, onChange, error, placeholder, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className={`input-field pl-12 pr-12 ${error ? 'error' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && (
        <p className="error-message">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

// Status states
const STATUS = {
  FORM: 'form',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_TOKEN: 'no_token',
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const token = searchParams.get('token');

  const [status, setStatus] = useState(token ? STATUS.FORM : STATUS.NO_TOKEN);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      setStatus(STATUS.NO_TOKEN);
    }
  }, [token]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitError('');
    setErrors({});

    // Validate password
    const passwordErrors = validatePassword(password);
    const newErrors = {};
    
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors[0].message;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setStatus(STATUS.SUCCESS);
      } else {
        if (result.message?.includes('expired') || result.message?.includes('invalid')) {
          setStatus(STATUS.ERROR);
          setSubmitError(result.message);
        } else {
          setSubmitError(result.message || 'Failed to reset password');
        }
      }
    } catch (err) {
      setSubmitError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [password, confirmPassword, token, resetPassword]);

  const renderContent = () => {
    switch (status) {
      case STATUS.SUCCESS:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-accent-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
            <p className="text-dark-300 mb-8">
              Your password has been changed. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full"
            >
              Continue to Login
            </button>
          </div>
        );

      case STATUS.ERROR:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Reset Link Invalid</h2>
            <p className="text-dark-300 mb-8">{submitError}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="btn-primary w-full"
              >
                Request New Reset Link
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full"
              >
                Back to Login
              </button>
            </div>
          </div>
        );

      case STATUS.NO_TOKEN:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
            <p className="text-dark-300 mb-8">
              This password reset link is invalid or has expired.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="btn-primary w-full"
              >
                Request New Reset Link
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full"
              >
                Back to Login
              </button>
            </div>
          </div>
        );

      case STATUS.FORM:
      default:
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Set new password</h2>
              <p className="text-dark-400">
                Your new password must be different from previously used passwords.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {submitError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              {/* New Password */}
              <div>
                <PasswordInput
                  label="New Password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: '' }));
                    setSubmitError('');
                  }}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <PasswordStrengthMeter password={password} />
              </div>

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                error={errors.confirmPassword}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-12"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <BackgroundShapes />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        {/* Card */}
        <div className="glass-card p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

