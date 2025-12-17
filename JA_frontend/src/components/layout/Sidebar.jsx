/**
 * Sidebar Navigation Component
 * Dark theme with smooth hover animations
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  User,
  CreditCard,
  Settings,
  Search,
  FileText,
  Bell,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Navigation items configuration
const navItems = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Jobs', icon: Search, path: '/jobs' },
  { label: 'Applications', icon: FileText, path: '/applications' },
  { label: 'Profile', icon: User, path: '/profile' },
  { label: 'Subscription', icon: CreditCard, path: '/subscription' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
];

const bottomItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
];

// Logo component
function Logo({ collapsed }) {
  return (
    <div className="flex items-center gap-3 px-4 h-16">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-glow flex-shrink-0">
        <Briefcase className="w-5 h-5 text-white" />
      </div>
      <span
        className={`
          text-lg font-bold text-white whitespace-nowrap
          transition-all duration-300
          ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
        `}
      >
        DEVision
      </span>
    </div>
  );
}

// Navigation item component
function NavItem({ item, collapsed }) {
  const { label, icon: Icon, path } = item;

  return (
    <NavLink
      to={path}
      className={({ isActive }) => `
        flex items-center h-11 px-3 gap-3 mx-2 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'bg-primary-500/20 text-primary-400'
          : 'text-dark-400 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <span
        className={`
          text-sm font-medium whitespace-nowrap
          transition-all duration-300
          ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
        `}
      >
        {label}
      </span>
    </NavLink>
  );
}

// Logout button component
function LogoutButton({ collapsed, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center h-11 px-3 gap-3 mx-2 rounded-lg w-[calc(100%-16px)]
        text-dark-400 hover:text-red-400 hover:bg-red-500/10
        transition-all duration-200
      "
    >
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <LogOut className="w-5 h-5" />
      </div>
      <span
        className={`
          text-sm font-medium whitespace-nowrap
          transition-all duration-300
          ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
        `}
      >
        Logout
      </span>
    </button>
  );
}

// User info component
function UserInfo({ collapsed, user }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg bg-white/5">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-semibold text-sm">
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </span>
      </div>
      <div
        className={`
          transition-all duration-300 overflow-hidden
          ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
        `}
      >
        <p className="text-sm font-medium text-white truncate max-w-[120px]">
          {user?.username || 'User'}
        </p>
        <p className="text-xs text-dark-400">Applicant</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className={`
        h-screen bg-dark-900 border-r border-white/5
        transition-all duration-300 ease-out
        flex flex-col
        ${collapsed ? 'w-[72px]' : 'w-56'}
      `}
    >
      {/* Logo */}
      <Logo collapsed={collapsed} />

      {/* Divider */}
      <div className="h-px bg-white/5 mx-4 my-2" />

      {/* Main Navigation */}
      <nav className="flex-1 py-2 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="py-2 flex flex-col gap-1">
        <div className="h-px bg-white/5 mx-4 mb-2" />
        
        {bottomItems.map((item) => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
        
        <LogoutButton collapsed={collapsed} onClick={handleLogout} />
      </div>

      {/* User Info */}
      <div className="py-4">
        <div className="h-px bg-white/5 mx-4 mb-4" />
        <UserInfo collapsed={collapsed} user={user} />
      </div>
    </aside>
  );
}
