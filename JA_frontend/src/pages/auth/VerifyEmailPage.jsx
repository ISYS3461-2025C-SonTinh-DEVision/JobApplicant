/**
 * Email Verification / Account Activation Page
 * 
 * Handles account activation via token from email
 * 
 * Architecture:
 * - A.3.a (Ultimo): Uses refined state management for activation flow
 * - Handles edge cases: already activated, expired token, network errors
 * - Premium UI with smooth animations and clear feedback
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Loader2, Mail, Briefcase, ArrowRight,
  RefreshCw, PartyPopper, Sparkles, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Background component with animated shapes
function BackgroundShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-mesh" />
      <div className="bg-shape w-96 h-96 bg-primary-600/20 -top-20 -left-20" style={{ animationDelay: '0s' }} />
      <div className="bg-shape w-80 h-80 bg-accent-500/15 bottom-1/4 -right-20" style={{ animationDelay: '2s' }} />
      <div className="bg-shape w-64 h-64 bg-primary-400/10 top-1/3 left-1/4" style={{ animationDelay: '4s' }} />
    </div>
  );
}

// Logo component
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
        <Briefcase className="w-6 h-6 text-white" />
      </div>
      <div>
        <span className="text-2xl font-bold text-white">DEVision</span>
        <p className="text-xs text-dark-400">Job Applicant Platform</p>
      </div>
    </Link>
  );
}

// Confetti animation component for success state
function ConfettiEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Status states
const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ALREADY_ACTIVATED: 'already_activated',
  ERROR: 'error',
  EXPIRED: 'expired',
  NO_TOKEN: 'no_token',
};

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activateAccount } = useAuth();

  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const token = searchParams.get('token');

  // Use ref to prevent duplicate API calls (React StrictMode / re-renders)
  const hasAttemptedActivation = useRef(false);
  const activationInProgress = useRef(false);

  // Memoized activation function
  const performActivation = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (activationInProgress.current) {
      return;
    }

    // Prevent duplicate activation attempts
    if (hasAttemptedActivation.current) {
      return;
    }

    if (!token) {
      setStatus(STATUS.NO_TOKEN);
      setMessage('No activation token provided.');
      return;
    }

    activationInProgress.current = true;
    hasAttemptedActivation.current = true;

    try {
      const result = await activateAccount(token);

      if (result.success) {
        // Check if already activated vs newly activated
        const isAlreadyActivated = result.message?.toLowerCase().includes('already activated');

        if (isAlreadyActivated) {
          setStatus(STATUS.ALREADY_ACTIVATED);
          setMessage('Your account is already activated. You can login now!');
        } else {
          setStatus(STATUS.SUCCESS);
          setMessage(result.message || 'Your account has been activated successfully!');
          setShowConfetti(true);

          // Auto-redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', {
              state: {
                message: 'Account activated! Please login to continue.',
                type: 'success'
              }
            });
          }, 3000);
        }
      } else {
        // Handle different error cases
        const errorMessage = result.message?.toLowerCase() || '';

        if (errorMessage.includes('expired')) {
          setStatus(STATUS.EXPIRED);
          setMessage('Your activation link has expired. Please register again to get a new link.');
        } else if (errorMessage.includes('already activated')) {
          // Backend might return success: false for already activated in some cases
          setStatus(STATUS.ALREADY_ACTIVATED);
          setMessage('Your account is already activated. You can login now!');
        } else {
          setStatus(STATUS.ERROR);
          setMessage(result.message || 'Failed to activate account. Please try again.');
        }
      }
    } catch (err) {
      // Handle HTTP errors from httpUtil
      const errorMessage = err.message?.toLowerCase() || '';
      const errorData = err.data;

      // Check if it's an "already activated" error (which is actually success)
      if (errorMessage.includes('already activated') || errorData?.message?.includes('already activated')) {
        setStatus(STATUS.ALREADY_ACTIVATED);
        setMessage('Your account is already activated. You can login now!');
      } else if (errorMessage.includes('invalid') || errorMessage.includes('token')) {
        // Invalid token - could be already used (activation successful on first call)
        // Check if status is 400 - token might have been used successfully
        if (err.status === 400) {
          // This often means token was already used (successful activation + page reload)
          setStatus(STATUS.ALREADY_ACTIVATED);
          setMessage('Your account has been activated! The link can only be used once.');
        } else {
          setStatus(STATUS.ERROR);
          setMessage('Invalid activation token. Please make sure you\'re using the latest link from your email.');
        }
      } else if (errorMessage.includes('expired')) {
        setStatus(STATUS.EXPIRED);
        setMessage('Your activation link has expired. Please register again to get a new link.');
      } else {
        setStatus(STATUS.ERROR);
        setMessage(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      activationInProgress.current = false;
    }
  }, [token, activateAccount, navigate]);

  // Perform activation on mount
  useEffect(() => {
    performActivation();
  }, [performActivation]);

  // Render loading state
  const renderLoading = () => (
    <div className="text-center animate-fade-in">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/30 to-primary-600/30 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Verifying your email...</h2>
      <p className="text-dark-400">Please wait while we activate your account.</p>
      <div className="mt-6 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );

  // Render success state
  const renderSuccess = () => (
    <div className="text-center animate-fade-in relative">
      {showConfetti && <ConfettiEffect />}

      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-accent-500/20 animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-accent-500/30 to-green-500/30 flex items-center justify-center">
          <PartyPopper className="w-12 h-12 text-accent-400" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-3">
        🎉 Welcome Aboard!
      </h2>
      <p className="text-dark-300 mb-2 text-lg">{message}</p>
      <p className="text-dark-500 text-sm mb-8">Redirecting to login in a few seconds...</p>

      <button
        onClick={() => navigate('/login')}
        className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3 shadow-glow hover:shadow-glow-lg transition-all"
      >
        <span>Continue to Login</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  // Render already activated state
  const renderAlreadyActivated = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-accent-500/20 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Already Verified!</h2>
      <p className="text-dark-300 mb-8">{message}</p>

      <button
        onClick={() => navigate('/login')}
        className="btn-primary inline-flex items-center gap-2 w-full justify-center"
      >
        <span>Go to Login</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  // Render expired state
  const renderExpired = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Link Expired</h2>
      <p className="text-dark-300 mb-8">{message}</p>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/register')}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Register Again</span>
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

  // Render error state
  const renderError = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
        <XCircle className="w-12 h-12 text-red-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
      <p className="text-dark-300 mb-8">{message}</p>

      <div className="space-y-3">
        <button
          onClick={() => {
            hasAttemptedActivation.current = false;
            setStatus(STATUS.LOADING);
            performActivation();
          }}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <button
          onClick={() => navigate('/register')}
          className="btn-secondary w-full"
        >
          Create New Account
        </button>
        <button
          onClick={() => navigate('/login')}
          className="text-dark-400 hover:text-white transition-colors text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  // Render no token state
  const renderNoToken = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <Mail className="w-12 h-12 text-amber-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
      <p className="text-dark-300 mb-6">
        We've sent you an activation link. Please check your inbox and click the link to verify your account.
      </p>

      <div className="bg-dark-700/50 rounded-xl p-4 mb-8">
        <p className="text-sm text-dark-400">
          <strong className="text-dark-300">Tip:</strong> Don't forget to check your spam folder if you don't see the email.
        </p>
      </div>

      <div className="space-y-3">
        <button className="btn-secondary w-full inline-flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Resend Activation Email</span>
        </button>
        <button
          onClick={() => navigate('/login')}
          className="text-dark-400 hover:text-white transition-colors text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );

  // Content renderer
  const renderContent = () => {
    switch (status) {
      case STATUS.LOADING:
        return renderLoading();
      case STATUS.SUCCESS:
        return renderSuccess();
      case STATUS.ALREADY_ACTIVATED:
        return renderAlreadyActivated();
      case STATUS.EXPIRED:
        return renderExpired();
      case STATUS.ERROR:
        return renderError();
      case STATUS.NO_TOKEN:
        return renderNoToken();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-dark-900">
      <BackgroundShapes />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Card */}
        <div className="glass-card p-8 backdrop-blur-xl">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-dark-500 text-sm">
            Need help?{' '}
            <Link to="/contact" className="text-primary-400 hover:text-primary-300 transition-colors">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
