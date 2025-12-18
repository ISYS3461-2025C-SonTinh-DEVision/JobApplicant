/**
 * Forgot Password Page
 * Request password reset email
 * 
 * Architecture Notes:
 * - Uses Headless Form hook (A.3.a - Headless UI) for form logic separation
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Briefcase, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { validateEmail } from '../../utils/validators/authValidators';
import { useAuth } from '../../context/AuthContext';
import useHeadlessForm from '../../components/headless/HeadlessForm';

// Background component
function BackgroundShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="bg-shape w-96 h-96 bg-primary-600/20 -top-20 -right-20" style={{ animationDelay: '0s' }} />
      <div className="bg-shape w-80 h-80 bg-accent-500/15 bottom-1/4 -left-20" style={{ animationDelay: '2s' }} />
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

/**
 * Validation function for forgot password form
 */
const validateForgotPasswordForm = (values) => {
  const errors = {};
  const emailErrors = validateEmail(values.email);
  if (emailErrors.length > 0) {
    errors.email = emailErrors[0].message;
  }
  return errors;
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

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
    },
    validate: validateForgotPasswordForm,
    onSubmit: async (formValues) => {
      const result = await forgotPassword(formValues.email);
      
      if (result.success) {
        setIsSuccess(true);
        return result;
      } else {
        throw new Error(result.message || 'Failed to send reset email');
      }
    },
  });

  // Success view
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <BackgroundShapes />
        
        <div className="relative z-10 w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          
          <div className="glass-card p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-accent-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-dark-300 mb-6">
              We've sent a password reset link to <span className="text-white font-medium">{values.email}</span>
            </p>
            <p className="text-sm text-dark-400 mb-8">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSuccess(false)}
                className="link"
              >
                try again
              </button>
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary w-full"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <BackgroundShapes />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        {/* Card */}
        <div className="glass-card p-8 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Forgot password?</h2>
            <p className="text-dark-400">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Error message */}
            {submitError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{submitError}</p>
              </div>
            )}

            {/* Email input - Using Headless Form values */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="nguyen.an@gmail.com"
                  required
                  autoComplete="email"
                  className={`input-field pl-12 ${touched.email && errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-red-400 text-xs flex items-center gap-1.5 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
