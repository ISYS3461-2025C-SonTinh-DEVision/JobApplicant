/**
 * Email Verification / Account Activation Page
 * Handles account activation via token from email
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail, Briefcase, ArrowRight } from 'lucide-react';
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
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  NO_TOKEN: 'no_token',
};

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activateAccount } = useAuth();

  const [status, setStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus(STATUS.NO_TOKEN);
        setMessage('No activation token provided.');
        return;
      }

      try {
        const result = await activateAccount(token);
        
        if (result.success) {
          setStatus(STATUS.SUCCESS);
          setMessage(result.message || 'Your account has been activated successfully!');
        } else {
          setStatus(STATUS.ERROR);
          setMessage(result.message || 'Failed to activate account.');
        }
      } catch (err) {
        setStatus(STATUS.ERROR);
        setMessage(err.message || 'An unexpected error occurred.');
      }
    };

    verifyEmail();
  }, [token, activateAccount]);

  const renderContent = () => {
    switch (status) {
      case STATUS.LOADING:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying your email...</h2>
            <p className="text-dark-400">Please wait while we activate your account.</p>
          </div>
        );

      case STATUS.SUCCESS:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-accent-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-dark-300 mb-8">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary inline-flex items-center gap-2"
            >
              Continue to Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );

      case STATUS.ERROR:
        return (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-dark-300 mb-8">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="btn-primary w-full"
              >
                Create New Account
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Mail className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-dark-300 mb-8">
              We've sent you an activation link. Please check your inbox and click the link to verify your account.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-dark-400">
                Didn't receive the email?{' '}
                <button className="link">Resend activation email</button>
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full mt-4"
              >
                Back to Login
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

