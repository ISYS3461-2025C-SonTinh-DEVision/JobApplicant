/**
 * 404 Not Found Page
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft, Briefcase, Search } from 'lucide-react';

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

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <BackgroundShapes />
      
      <div className="relative z-10 w-full max-w-lg text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[12rem] font-bold text-dark-800 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-primary-500/20 flex items-center justify-center animate-pulse-slow">
                <Search className="w-12 h-12 text-primary-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-dark-300 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-dark-400 mb-4">Popular destinations:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/jobs" className="link text-sm">
              Browse Jobs
            </Link>
            <Link to="/profile" className="link text-sm">
              My Profile
            </Link>
            <Link to="/applications" className="link text-sm">
              Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

