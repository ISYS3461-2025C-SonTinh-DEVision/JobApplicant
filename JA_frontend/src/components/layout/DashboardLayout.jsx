/**
 * Dashboard Layout Component
 * 
 * Main layout for authenticated user dashboard
 * Features:
 * - Collapsible sidebar with toggle button
 * - Responsive sidebar navigation
 * - Header with user info, notifications, and theme toggle
 * - Mobile menu toggle
 * - Light/Dark mode support
 * - Headless UI integration (useHeadlessModal, useHeadlessToggle)
 * 
 * Architecture: A.2.b - Componentized Frontend + A.3.a Headless UI
 */

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, User, Briefcase, Search, Bell, Settings,
  LogOut, Menu, X, ChevronDown, Crown, ChevronLeft, ChevronRight,
  FileText, TrendingUp, Sun, Moon, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useHeadlessModal, useHeadlessToggle } from '../../components/headless';

/**
 * Theme Toggle Button
 */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${isDark
          ? 'text-dark-400 hover:text-yellow-400 hover:bg-dark-700'
          : 'text-gray-500 hover:text-amber-500 hover:bg-gray-100'
        }
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}

/**
 * Navigation Item Component
 * Supports collapsed mode with tooltip
 */
function NavItem({ to, icon: Icon, label, badge, isActive, onClick, className = '', isDark, isCollapsed = false }) {
  return (
    <button
      onClick={() => onClick(to)}
      title={isCollapsed ? label : undefined}
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl
        transition-all duration-200 group relative
        ${isCollapsed ? 'justify-center px-3' : ''}
        ${isActive
          ? 'bg-primary-600 text-white shadow-glow'
          : isDark
            ? 'text-dark-300 hover:bg-dark-700/50 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }
        ${className}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive
        ? 'text-white'
        : isDark
          ? 'text-dark-400 group-hover:text-primary-400'
          : 'text-gray-400 group-hover:text-primary-500'
        }`} />
      {!isCollapsed && (
        <>
          <span className="font-medium flex-1 text-left">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-accent-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className={`
          absolute left-full ml-2 px-3 py-2 rounded-lg text-sm font-medium
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 z-50 whitespace-nowrap
          ${isDark ? 'bg-dark-700 text-white shadow-lg' : 'bg-gray-800 text-white shadow-lg'}
        `}>
          {label}
          {badge && <span className="ml-2 px-1.5 py-0.5 text-xs bg-accent-500 rounded-full">{badge}</span>}
        </div>
      )}
    </button>
  );
}

/**
 * User Profile Dropdown in Header
 * Uses useHeadlessModal for dropdown logic
 */
function UserDropdown({ user, onLogout, isDark }) {
  const navigate = useNavigate();
  const { isOpen, open, close, toggle } = useHeadlessModal();

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-xl transition-colors
          ${isDark
            ? 'bg-dark-800 hover:bg-dark-700'
            : 'bg-gray-100 hover:bg-gray-200'
          }
        `}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="Avatar"
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {user?.firstName || 'User'} {user?.lastName || ''}
          </p>
          <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{user?.email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDark ? 'text-dark-400' : 'text-gray-400'
          } ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={close}
          />

          {/* Dropdown Menu */}
          <div className={`
            absolute right-0 mt-2 w-56 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in
            ${isDark
              ? 'bg-dark-800 border border-dark-700'
              : 'bg-white border border-gray-200'
            }
          `}>
            <div className={`p-4 border-b ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.firstName || 'User'} {user?.lastName || ''}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{user?.email}</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  navigate('/dashboard/profile');
                  close();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isDark
                    ? 'text-dark-300 hover:bg-dark-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">My Profile</span>
              </button>

              <button
                onClick={() => {
                  navigate('/dashboard/settings');
                  close();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${isDark
                    ? 'text-dark-300 hover:bg-dark-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
            </div>

            <div className={`p-2 border-t ${isDark ? 'border-dark-700' : 'border-gray-100'}`}>
              <button
                onClick={() => {
                  onLogout();
                  close();
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
  const { isDark } = useTheme();
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

  // Sidebar collapse state using useHeadlessToggle with localStorage persistence
  const sidebarCollapse = useHeadlessToggle({
    initialValue: false,
    storageKey: 'dashboard-sidebar-collapsed',
  });
  const isCollapsed = sidebarCollapse.isOn;

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Sidebar - Desktop (Collapsible) */}
      <aside className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        ${isDark
          ? 'bg-dark-800 border-r border-dark-700'
          : 'bg-white border-r border-gray-200'
        }
      `}>
        {/* Logo */}
        <div className={`
          flex items-center gap-3 px-4 py-5 border-b relative
          ${isCollapsed ? 'justify-center' : 'px-6'}
          ${isDark ? 'border-dark-700' : 'border-gray-200'}
        `}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow flex-shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>DEVision</h1>
              <p className={`text-xs truncate ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Job Applicant</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {navigationItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={isActive(item.to, item.exact)}
              onClick={handleNavigation}
              isDark={isDark}
              isCollapsed={isCollapsed}
              className={item.highlight ? `
                ${isDark
                  ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20'
                  : 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200'
                }
              ` : ''}
            />
          ))}
        </nav>

        {/* Toggle Button */}
        <div className={`px-4 py-3 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
          <button
            onClick={sidebarCollapse.toggle}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              transition-all duration-200 group
              ${isCollapsed ? 'justify-center px-3' : ''}
              ${isDark
                ? 'text-dark-400 hover:bg-dark-700/50 hover:text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" />
                <span className="font-medium text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>

        {/* User Section */}
        <div className={`p-4 border-t ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
          <div className={`
            flex items-center gap-3 py-3 rounded-xl
            ${isCollapsed ? 'justify-center px-0' : 'px-4'}
            ${isDark ? 'bg-dark-700' : 'bg-gray-100'}
          `}>
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {currentUser?.firstName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
                </p>
                <p className={`text-xs truncate ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                  {currentUser?.email}
                </p>
              </div>
            )}
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
          <aside className={`
            fixed inset-y-0 left-0 w-64 z-50 lg:hidden animate-slide-in-left
            ${isDark
              ? 'bg-dark-800 border-r border-dark-700'
              : 'bg-white border-r border-gray-200'
            }
          `}>
            {/* Logo */}
            <div className={`
              flex items-center justify-between px-6 py-5 border-b
              ${isDark ? 'border-dark-700' : 'border-gray-200'}
            `}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>DEVision</h1>
                  <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Job Applicant</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className={`transition-colors ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
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
                  isDark={isDark}
                  className={item.highlight ? `
                    ${isDark
                      ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20'
                      : 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200'
                    }
                  ` : ''}
                />
              ))}
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className={`
          sticky top-0 z-30 backdrop-blur-sm border-b
          ${isDark
            ? 'bg-dark-800/95 border-dark-700'
            : 'bg-white/95 border-gray-200'
          }
        `}>
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`lg:hidden transition-colors ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Page Title - Desktop Only */}
              <div className="hidden lg:block">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {navigationItems.find(item => isActive(item.to, item.exact))?.label || 'Dashboard'}
                </h2>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <button className={`
                  relative p-2 rounded-lg transition-colors
                  ${isDark
                    ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}>
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
                  )}
                </button>

                {/* User Dropdown */}
                <UserDropdown user={currentUser} onLogout={handleLogout} isDark={isDark} />
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

