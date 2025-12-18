/**
 * SSO Callback Page
 * Handles OAuth callback from Google/GitHub
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Briefcase } from 'lucide-react';
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

// Status states
const STATUS = {
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function SSOCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();

  const [status, setStatus] = useState(STATUS.PROCESSING);
  const [errorMessage, setErrorMessage] = useState('');

  // Get parameters from URL
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    const processCallback = async () => {
      // Check for OAuth error in URL
      if (error) {
        setStatus(STATUS.ERROR);
        setErrorMessage(errorDescription || 'Authentication was cancelled or failed.');
        return;
      }

      // Check for authorization code
      if (!code) {
        setStatus(STATUS.ERROR);
        setErrorMessage('No authorization code received from provider.');
        return;
      }

      try {
        const result = await handleGoogleCallback(code);
        
        if (result.success) {
          setStatus(STATUS.SUCCESS);
          // Redirect after success animation
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1500);
        } else {
          setStatus(STATUS.ERROR);
          setErrorMessage(result.message || 'Failed to complete authentication.');
        }
      } catch (err) {
        setStatus(STATUS.ERROR);
        setErrorMessage(err.message || 'An unexpected error occurred.');
      }
    };

    processCallback();
  }, [code, error, errorDescription, handleGoogleCallback, navigate]);

  const renderContent = () => {
    switch (status) {
      case STATUS.PROCESSING:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Completing sign in...</h2>
            <p className="text-dark-400">Please wait while we verify your credentials.</p>
          </div>
        );

      case STATUS.SUCCESS:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-accent-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
            <p className="text-dark-300">Redirecting you to the dashboard...</p>
          </div>
        );

      case STATUS.ERROR:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-dark-300 mb-8">{errorMessage}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn-secondary w-full"
              >
                Create Account Instead
              </button>
            </div>
          </div>
        );

      default:
        return null;
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

