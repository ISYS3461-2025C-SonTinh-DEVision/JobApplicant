/**
 * Dashboard Layout Component
 * 
 * Main layout for authenticated user dashboard
 * Features:
 * - Responsive sidebar navigation
 * - Header with user info and notifications
 * - Mobile menu toggle
 * - Smooth transitions
 * 
 * Architecture: A.2.b - Componentized Frontend
 * - Layout structure separated from content
 * - Reusable across different dashboard pages
 */

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, User, Briefcase, Search, Bell, Settings, 
  LogOut, Menu, X, ChevronDown, Crown,
  FileText, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Navigation Item Component
 */
function NavItem({ to, icon: Icon, label, badge, isActive, onClick, className = '' }) {
  return (
    <button
      onClick={() => onClick(to)}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl
        transition-all duration-200 group
        ${isActive 
          ? 'bg-primary-600 text-white shadow-glow' 
          : 'text-dark-300 hover:bg-dark-700/50 hover:text-white'
        }
        ${className}
      `}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-dark-400 group-hover:text-primary-400'}`} />
      <span className="font-medium flex-1 text-left">{label}</span>
      {badge && (
        <span className="px-2 py-0.5 text-xs font-semibold bg-accent-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

/**
 * User Profile Dropdown in Header
 */
function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">
            {user?.firstName || 'User'} {user?.lastName || ''}
          </p>
          <p className="text-xs text-dark-400">{user?.email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-dark-700">
              <p className="text-sm font-medium text-white">
                {user?.firstName || 'User'} {user?.lastName || ''}
              </p>
              <p className="text-xs text-dark-400 mt-1">{user?.email}</p>
            </div>
            
            <div className="p-2">
              <button
                onClick={() => {
                  navigate('/dashboard/profile');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">My Profile</span>
              </button>
              
              <button
                onClick={() => {
                  navigate('/dashboard/settings');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-dark-300 hover:bg-dark-700 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
            </div>

            <div className="p-2 border-t border-dark-700">
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Dashboard Layout Component
 */
export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount] = useState(3); // TODO: Get from notifications context

  // Navigation items
  const navigationItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard', exact: true },
    { to: '/dashboard/profile', icon: User, label: 'My Profile' },
    { to: '/dashboard/applications', icon: FileText, label: 'Applications', badge: '2' },
    { to: '/dashboard/jobs', icon: Search, label: 'Find Jobs' },
    { to: '/dashboard/subscription', icon: Crown, label: 'Premium', highlight: true },
    { to: '/dashboard/analytics', icon: TrendingUp, label: 'Analytics' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-dark-800 border-r border-dark-700">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-700">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DEVision</h1>
            <p className="text-xs text-dark-400">Job Applicant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={isActive(item.to, item.exact)}
              onClick={handleNavigation}
              className={item.highlight ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20' : ''}
            />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-dark-700">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {currentUser?.firstName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
              </p>
              <p className="text-xs text-dark-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-dark-800 border-r border-dark-700 z-50 lg:hidden animate-slide-in-left">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">DEVision</h1>
                  <p className="text-xs text-dark-400">Job Applicant</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  badge={item.badge}
                  isActive={isActive(item.to, item.exact)}
                  onClick={handleNavigation}
                  className={item.highlight ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20' : ''}
                />
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-dark-800/95 backdrop-blur-sm border-b border-dark-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-dark-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Page Title - Desktop Only */}
              <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-white">
                  {navigationItems.find(item => isActive(item.to, item.exact))?.label || 'Dashboard'}
                </h2>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
                  )}
                </button>

                {/* User Dropdown */}
                <UserDropdown user={currentUser} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

