/**
 * SSO Callback Page (Legacy)
 * 
 * This page was used for the Authorization Code Flow.
 * The application now uses Google Identity Services with ID Token Flow,
 * which doesn't require a callback redirect.
 * 
 * This page is kept for backwards compatibility and will redirect users
 * to the login page if they somehow land here.
 * 
 * @deprecated Use GoogleSSOButton with Google Identity Services instead
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Briefcase, ArrowLeft } from 'lucide-react';

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

export default function SSOCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  // Get parameters from URL
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    // If there's an error, show it
    if (error) {
      console.warn('SSO Callback Error:', error, errorDescription);
    }

    // If there's a code, the old authorization code flow was attempted
    if (code) {
      console.warn('SSO Callback received authorization code. This flow is deprecated. Use Google Identity Services instead.');
    }

    // Countdown and redirect to login
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [code, error, errorDescription, navigate]);

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
          <div className="text-center animate-fade-in">
            {error ? (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Authentication Error</h2>
                <p className="text-dark-300 mb-4">{errorDescription || 'Something went wrong during sign-in.'}</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">SSO Flow Updated</h2>
                <p className="text-dark-300 mb-4">
                  Our sign-in process has been updated. Please use the Google Sign-In button on the login page.
                </p>
              </>
            )}

            <p className="text-dark-400 text-sm mb-6">
              Redirecting to login page in <span className="text-primary-400 font-mono">{countdown}s</span>...
            </p>

            <button
              onClick={() => navigate('/login', { replace: true })}
              className="btn-primary w-full inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
