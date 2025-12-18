/**
 * Registration Page
 * Beautiful dark theme with gradient mesh background
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Sparkles } from 'lucide-react';
import RegisterForm from '../../components/auth/RegisterForm';

// Animated background shapes
function BackgroundShapes() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-gradient-mesh" />
      
      {/* Floating shapes */}
      <div className="bg-shape w-96 h-96 bg-primary-600/20 -top-20 -left-20" style={{ animationDelay: '0s' }} />
      <div className="bg-shape w-80 h-80 bg-accent-500/15 top-1/4 -right-20" style={{ animationDelay: '2s' }} />
      <div className="bg-shape w-72 h-72 bg-primary-500/10 bottom-20 left-1/4" style={{ animationDelay: '4s' }} />
      <div className="bg-shape w-64 h-64 bg-accent-600/10 -bottom-10 right-1/3" style={{ animationDelay: '1s' }} />
      
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

// Feature item for sidebar
function FeatureItem({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
        <Icon className="w-5 h-5 text-primary-400" />
      </div>
      <div>
        <h4 className="font-medium text-white mb-1">{title}</h4>
        <p className="text-sm text-dark-400">{description}</p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleSuccess = (result) => {
    // Registration successful - user needs to verify email
    // The success message is shown in RegisterForm
    console.log('Registration successful:', result);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      <BackgroundShapes />
      
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[45%] relative z-10 flex-col justify-between p-12">
        {/* Logo */}
        <Logo />
        
        {/* Main Content */}
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start your career journey with{' '}
            <span className="gradient-text">DEVision</span>
          </h1>
          <p className="text-lg text-dark-300 mb-12">
            Join thousands of developers finding their dream jobs in tech.
          </p>
          
          {/* Features */}
          <div className="space-y-8">
            <FeatureItem
              icon={Sparkles}
              title="Smart Job Matching"
              description="Get matched with jobs that fit your skills and career goals."
            />
            <FeatureItem
              icon={Sparkles}
              title="Real-time Notifications"
              description="Be the first to know when new opportunities match your profile."
            />
            <FeatureItem
              icon={Sparkles}
              title="Premium Features"
              description="Unlock powerful tools to accelerate your job search."
            />
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-sm text-dark-500">
          © {new Date().getFullYear()} DEVision. All rights reserved.
        </p>
      </div>
      
      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 xl:w-[55%] relative z-10 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>
          
          {/* Form Card */}
          <div className="glass-card p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
              <p className="text-dark-400">
                Join DEVision and discover your next opportunity
              </p>
            </div>
            
            <RegisterForm
              onSuccess={handleSuccess}
              onLoginClick={handleLoginClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

