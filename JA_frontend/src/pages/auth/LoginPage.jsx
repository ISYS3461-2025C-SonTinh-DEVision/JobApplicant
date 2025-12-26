/**
 * Login Page
 * Beautiful dark theme with gradient mesh background
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Shield, Zap, Globe } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';

// Animated background shapes
function BackgroundShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Floating shapes */}
      <div className="bg-shape w-96 h-96 bg-primary-600/20 -top-20 -right-20" style={{ animationDelay: '0s' }} />
      <div className="bg-shape w-80 h-80 bg-accent-500/15 bottom-1/4 -left-20" style={{ animationDelay: '2s' }} />
      <div className="bg-shape w-72 h-72 bg-primary-500/10 top-1/3 right-1/4" style={{ animationDelay: '4s' }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

// Logo component
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
        <Briefcase className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-white">DEVision</span>
    </div>
  );
}

// Stats component for sidebar
function StatsItem({ icon: Icon, value, label }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-primary-400" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-dark-400">{label}</div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect URL from state (if coming from protected route)
  const from = location.state?.from?.pathname || '/';

  const handleSuccess = () => {
    // Navigate to the page user was trying to access, or home
    navigate(from, { replace: true });
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleForgotPasswordClick = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex">
      <BackgroundShapes />

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[55%] relative z-10 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-dark-400">
                Sign in to continue to your dashboard
              </p>
            </div>

            <LoginForm
              onSuccess={handleSuccess}
              onRegisterClick={handleRegisterClick}
              onForgotPasswordClick={handleForgotPasswordClick}
            />
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-dark-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Secure Login</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Fast & Reliable</span>
            </div>
          </div>

          {/* Admin Login Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="inline-flex items-center gap-2 text-sm text-dark-500 hover:text-violet-400 transition-colors group"
            >
              <Shield className="w-4 h-4 group-hover:text-violet-400" />
              <span>Login as Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Branding & Stats */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative z-10 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex justify-end">
          <Logo />
        </div>

        {/* Main Content */}
        <div className="max-w-md ml-auto text-right">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your next career move starts with{' '}
            <span className="gradient-text">DEVision</span>
          </h1>
          <p className="text-lg text-dark-300 mb-12">
            Connect with top tech companies and find opportunities that match your expertise.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <StatsItem
              icon={Briefcase}
              value="10K+"
              label="Job Posts"
            />
            <StatsItem
              icon={Globe}
              value="500+"
              label="Companies"
            />
            <StatsItem
              icon={Zap}
              value="50K+"
              label="Applicants"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <p className="text-sm text-dark-500">
            © {new Date().getFullYear()} DEVision. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

