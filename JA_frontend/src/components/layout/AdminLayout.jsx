/**
 * Admin Layout
 * Dashboard layout with sidebar navigation for admin panel
 * 
 * Architecture: A.2.b - Componentized Frontend
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    Shield,
    LayoutDashboard,
    Users,
    Building2,
    Briefcase,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

// Navigation items configuration
const navItems = [
    {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
    },
    {
        path: '/admin/applicants',
        label: 'Applicants',
        icon: Users,
    },
    {
        path: '/admin/companies',
        label: 'Companies',
        icon: Building2,
    },
    {
        path: '/admin/job-posts',
        label: 'Job Posts',
        icon: Briefcase,
    },
];

// Sidebar component
function AdminSidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { admin, adminLogout } = useAdminAuth();

    const handleLogout = async () => {
        await adminLogout();
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
                style={{
                    background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
                }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-white">DEVision</span>
                                    <span className="block text-xs text-violet-400">Admin</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="lg:hidden p-2 text-dark-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                        : 'text-dark-300 hover:bg-white/5 hover:text-white'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                            </NavLink>
                        ))}
                    </nav>

                    {/* User info & Logout */}
                    <div className="p-4 border-t border-white/10">
                        <div className="mb-4 p-3 rounded-xl bg-white/5">
                            <p className="text-sm font-medium text-white truncate">
                                {admin?.name || 'Administrator'}
                            </p>
                            <p className="text-xs text-dark-400 truncate">
                                {admin?.email || 'admin@devision.com'}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// Header component
function AdminHeader({ onMenuClick }) {
    return (
        <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-dark-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex-1 lg:hidden" />
                <div className="hidden lg:block">
                    <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
                </div>
            </div>
        </header>
    );
}

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-0 overflow-x-hidden">
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
