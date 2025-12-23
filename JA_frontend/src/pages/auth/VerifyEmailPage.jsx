/**
 * Email Verification / Account Activation Page
 * 
 * Handles account activation via token from email
 * 
 * Architecture:
 * - A.3.a (Ultimo): Smart caching with localStorage to handle duplicate activations
 * - Handles edge cases: already activated, expired token, network errors
 * - Premium UI with smooth animations and clear feedback
 * - 5-minute cache for activation status to improve UX on link re-clicks
 * - Resend activation with 60-second cooldown anti-spam protection
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Loader2, Mail, Briefcase, ArrowRight,
  RefreshCw, PartyPopper, Sparkles, AlertTriangle, LogIn, Clock, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/AuthService';

// ============================================
// CONSTANTS & UTILITIES
// ============================================

const STORAGE_KEY_PREFIX = 'activation_status_';
const RESEND_COOLDOWN_KEY = 'resend_cooldown_';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Save activation status to localStorage with expiry
 */
const saveActivationStatus = (token, status) => {
  try {
    const data = {
      status,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS
    };
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${token}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save activation status to localStorage:', e);
  }
};

/**
 * Get cached activation status from localStorage
 * Returns null if not found or expired
 */
const getCachedActivationStatus = (token) => {
  try {
    const cached = localStorage.getItem(`${STORAGE_KEY_PREFIX}${token}`);
    if (!cached) return null;

    const data = JSON.parse(cached);

    // Check if cache has expired
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${token}`);
      return null;
    }

    return data.status;
  } catch (e) {
    console.warn('Failed to read activation status from localStorage:', e);
    return null;
  }
};

/**
 * Get remaining cooldown seconds for resend
 */
const getResendCooldownRemaining = (email) => {
  try {
    const key = `${RESEND_COOLDOWN_KEY}${email}`;
    const expiresAt = localStorage.getItem(key);
    if (!expiresAt) return 0;

    const remaining = Math.ceil((parseInt(expiresAt, 10) - Date.now()) / 1000);
    if (remaining <= 0) {
      localStorage.removeItem(key);
      return 0;
    }
    return remaining;
  } catch (e) {
    return 0;
  }
};

/**
 * Set resend cooldown
 */
const setResendCooldown = (email, seconds = RESEND_COOLDOWN_SECONDS) => {
  try {
    const key = `${RESEND_COOLDOWN_KEY}${email}`;
    localStorage.setItem(key, String(Date.now() + seconds * 1000));
  } catch (e) {
    console.warn('Failed to set resend cooldown:', e);
  }
};

// ============================================
// COMPONENTS
// ============================================

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

// Countdown timer component
function CountdownTimer({ seconds, onComplete }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining(r => r - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining, onComplete]);

  return (
    <span className="text-dark-400 text-sm">
      (Redirecting in {remaining}s)
    </span>
  );
}

// Resend button with cooldown
function ResendButton({ email, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize cooldown from localStorage
  useEffect(() => {
    if (email) {
      const remaining = getResendCooldownRemaining(email);
      setCooldown(remaining);
    }
  }, [email]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || isLoading || cooldown > 0) return;

    setIsLoading(true);
    setSuccessMessage('');

    try {
      const authService = new AuthService();
      const result = await authService.resendActivationEmail(email);

      if (result.success) {
        setSuccessMessage(result.message || 'Activation email sent!');
        // Set cooldown
        const cooldownSeconds = result.cooldownSeconds || RESEND_COOLDOWN_SECONDS;
        setResendCooldown(email, cooldownSeconds);
        setCooldown(cooldownSeconds);
        onSuccess?.(result);
      } else if (result.alreadyActivated) {
        setSuccessMessage('Your account is already activated!');
        onSuccess?.(result);
      } else {
        onError?.(result.message || 'Failed to send email');
      }
    } catch (err) {
      // Handle rate limiting (429)
      if (err.status === 429 && err.data?.retryAfterSeconds) {
        const retryAfter = err.data.retryAfterSeconds;
        setResendCooldown(email, retryAfter);
        setCooldown(retryAfter);
        onError?.(`Please wait ${retryAfter} seconds before trying again.`);
      } else {
        onError?.(err.message || 'Failed to send activation email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleResend}
        disabled={isLoading || cooldown > 0 || !email}
        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${cooldown > 0 || isLoading
          ? 'bg-dark-600 text-dark-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 hover:shadow-glow'
          }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : cooldown > 0 ? (
          <>
            <Clock className="w-4 h-4" />
            <span>Resend in {cooldown}s</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Resend Activation Email</span>
          </>
        )}
      </button>

      {successMessage && (
        <div className="flex items-center gap-2 text-sm text-accent-400 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

// Email input for resend (when we don't have it)
function EmailInputResend({ onSuccess, onError }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || isLoading || cooldown > 0) return;

    // Check if already in cooldown for this email
    const remaining = getResendCooldownRemaining(email);
    if (remaining > 0) {
      setCooldown(remaining);
      setErrorMessage(`Please wait ${remaining} seconds before trying again.`);
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const authService = new AuthService();
      const result = await authService.resendActivationEmail(email);

      if (result.success) {
        setSuccessMessage(result.message || 'Activation email sent! Check your inbox.');
        const cooldownSeconds = result.cooldownSeconds || RESEND_COOLDOWN_SECONDS;
        setResendCooldown(email, cooldownSeconds);
        setCooldown(cooldownSeconds);
        onSuccess?.(result);
      } else if (result.alreadyActivated) {
        setSuccessMessage('Your account is already activated! You can login now.');
      } else {
        setErrorMessage(result.message || 'Failed to send email');
        onError?.(result.message);
      }
    } catch (err) {
      if (err.status === 429 && err.data?.retryAfterSeconds) {
        const retryAfter = err.data.retryAfterSeconds;
        setResendCooldown(email, retryAfter);
        setCooldown(retryAfter);
        setErrorMessage(`Rate limited. Please wait ${retryAfter} seconds.`);
      } else {
        setErrorMessage(err.message || 'Failed to send activation email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="resend-email" className="block text-sm font-medium text-dark-300 mb-2">
          Enter your email address
        </label>
        <input
          id="resend-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="input-field"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || cooldown > 0 || !email}
        className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${cooldown > 0 || isLoading
          ? 'bg-dark-600 text-dark-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-500 hover:to-primary-400 hover:shadow-glow'
          }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : cooldown > 0 ? (
          <>
            <Clock className="w-4 h-4" />
            <span>Resend in {cooldown}s</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Activation Email</span>
          </>
        )}
      </button>

      {successMessage && (
        <div className="flex items-center gap-2 text-sm text-accent-400 animate-fade-in p-3 bg-accent-500/10 rounded-lg">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-400 animate-fade-in p-3 bg-red-500/10 rounded-lg">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
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

// ============================================
// MAIN COMPONENT
// ============================================

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activateAccount } = useAuth();

  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [resendError, setResendError] = useState('');

  const token = searchParams.get('token');

  // Use ref to prevent duplicate API calls (React StrictMode / re-renders)
  const hasAttemptedActivation = useRef(false);
  const activationInProgress = useRef(false);

  // Handle redirect to login
  const handleRedirectToLogin = useCallback(() => {
    navigate('/login', {
      state: {
        message: 'Account activated! Please login to continue.',
        type: 'success'
      }
    });
  }, [navigate]);

  // Memoized activation function
  const performActivation = useCallback(async () => {
    if (activationInProgress.current) return;
    if (hasAttemptedActivation.current) return;

    if (!token) {
      setStatus(STATUS.NO_TOKEN);
      setMessage('No activation token provided.');
      return;
    }

    // Check localStorage cache first
    const cachedStatus = getCachedActivationStatus(token);
    if (cachedStatus === 'activated') {
      setStatus(STATUS.ALREADY_ACTIVATED);
      setMessage('This activation link has already been used. Your account is active!');
      hasAttemptedActivation.current = true;
      return;
    }

    activationInProgress.current = true;
    hasAttemptedActivation.current = true;

    try {
      const result = await activateAccount(token);

      if (result.success) {
        const isAlreadyActivated = result.message?.toLowerCase().includes('already activated');

        if (isAlreadyActivated) {
          saveActivationStatus(token, 'activated');
          setStatus(STATUS.ALREADY_ACTIVATED);
          setMessage('Your account is already activated. You can login now!');
        } else {
          saveActivationStatus(token, 'activated');
          setStatus(STATUS.SUCCESS);
          setMessage(result.message || 'Your account has been activated successfully!');
          setShowConfetti(true);
        }
      } else {
        const errorMessage = result.message?.toLowerCase() || '';

        if (errorMessage.includes('expired')) {
          setStatus(STATUS.EXPIRED);
          setMessage('Your activation link has expired. Please request a new one.');
        } else if (errorMessage.includes('already activated')) {
          saveActivationStatus(token, 'activated');
          setStatus(STATUS.ALREADY_ACTIVATED);
          setMessage('Your account is already activated. You can login now!');
        } else {
          setStatus(STATUS.ERROR);
          setMessage(result.message || 'Failed to activate account.');
        }
      }
    } catch (err) {
      const errorMessage = err.message?.toLowerCase() || '';
      const errorDataMessage = err.data?.message?.toLowerCase() || '';
      const httpStatus = err.status;

      if (httpStatus === 400) {
        if (errorMessage.includes('expired') || errorDataMessage.includes('expired')) {
          setStatus(STATUS.EXPIRED);
          setMessage('Your activation link has expired. Please request a new one.');
        } else {
          saveActivationStatus(token, 'activated');
          setStatus(STATUS.ALREADY_ACTIVATED);
          setMessage('Your account has been activated! You can now login.');
        }
      } else if (errorMessage.includes('expired') || errorDataMessage.includes('expired')) {
        setStatus(STATUS.EXPIRED);
        setMessage('Your activation link has expired. Please request a new one.');
      } else {
        setStatus(STATUS.ERROR);
        setMessage(err.message || 'An unexpected error occurred.');
      }
    } finally {
      activationInProgress.current = false;
    }
  }, [token, activateAccount]);

  // Perform activation on mount
  useEffect(() => {
    performActivation();
  }, [performActivation]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

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
    </div>
  );

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

      <h2 className="text-3xl font-bold text-white mb-3">🎉 Welcome Aboard!</h2>
      <p className="text-dark-300 mb-2 text-lg">{message}</p>
      <div className="mb-8">
        <CountdownTimer seconds={30} onComplete={handleRedirectToLogin} />
      </div>

      <button
        onClick={handleRedirectToLogin}
        className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3 shadow-glow hover:shadow-glow-lg transition-all"
      >
        <span>Continue to Login</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderAlreadyActivated = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-accent-500/20 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Already Verified! ✨</h2>
      <p className="text-dark-300 mb-6">{message}</p>

      <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
        <p className="text-sm text-dark-400">
          <strong className="text-accent-400">Good news!</strong> Your account is already active.
          Click below to login and start exploring.
        </p>
      </div>

      <button
        onClick={handleRedirectToLogin}
        className="btn-primary inline-flex items-center gap-2 w-full justify-center"
      >
        <LogIn className="w-4 h-4" />
        <span>Go to Login</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  const renderExpired = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Link Expired</h2>
      <p className="text-dark-300 mb-6">{message}</p>

      <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
        <p className="text-sm text-dark-400 mb-4">
          Enter your email below to receive a new activation link:
        </p>
        <EmailInputResend
          onSuccess={() => { }}
          onError={(msg) => setResendError(msg)}
        />
      </div>

      <button
        onClick={() => navigate('/login')}
        className="text-dark-400 hover:text-white transition-colors text-sm"
      >
        Back to Login
      </button>
    </div>
  );

  const renderError = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
        <XCircle className="w-12 h-12 text-red-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Verification Failed</h2>
      <p className="text-dark-300 mb-6">{message}</p>

      {resendError && (
        <div className="flex items-center gap-2 text-sm text-red-400 mb-4 p-3 bg-red-500/10 rounded-lg">
          <XCircle className="w-4 h-4" />
          <span>{resendError}</span>
        </div>
      )}

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

  const renderNoToken = () => (
    <div className="text-center animate-fade-in">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <Mail className="w-12 h-12 text-amber-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
      <p className="text-dark-300 mb-6">
        We've sent you an activation link. Please check your inbox and click the link to verify your account.
      </p>

      <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
        <p className="text-sm text-dark-400 mb-1">
          <strong className="text-dark-300">Tip:</strong> Don't forget to check your spam folder.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm text-dark-400 mb-4">
          Didn't receive the email? Enter your email to resend:
        </p>
        <EmailInputResend
          onSuccess={() => { }}
          onError={(msg) => setResendError(msg)}
        />
      </div>

      <button
        onClick={() => navigate('/login')}
        className="text-dark-400 hover:text-white transition-colors text-sm"
      >
        Back to Login
      </button>
    </div>
  );

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
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="glass-card p-8 backdrop-blur-xl">
          {renderContent()}
        </div>

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
