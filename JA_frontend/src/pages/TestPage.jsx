/**
 * Test/Dashboard Page
 * Demo page showing reusable components
 */

import React, { useState } from 'react';
import {
  Button,
  Input,
  Tag,
  Modal,
} from '../components/reusable';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Briefcase, FileText, TrendingUp, Users } from 'lucide-react';

// Stats Card Component
function StatsCard({ icon: Icon, label, value, trend, trendUp }) {
  return (
    <div className="glass-card p-6 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary-400" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trendUp ? 'text-accent-400' : 'text-red-400'}`}>
            {trendUp ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-dark-400">{label}</p>
    </div>
  );
}

// Recent Applications Table
function RecentApplications() {
  const applications = [
    { id: 1, company: 'Google', position: 'Senior Software Engineer', status: 'In Review', date: '2 days ago' },
    { id: 2, company: 'Meta', position: 'Full Stack Developer', status: 'Interview', date: '5 days ago' },
    { id: 3, company: 'Amazon', position: 'Backend Engineer', status: 'Applied', date: '1 week ago' },
  ];

  const statusColors = {
    'Applied': 'default',
    'In Review': 'primary',
    'Interview': 'success',
    'Rejected': 'danger',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
        <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={app.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-dark-400" />
              </div>
              <div>
                <p className="font-medium text-white">{app.position}</p>
                <p className="text-sm text-dark-400">{app.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Tag label={app.status} variant={statusColors[app.status]} />
              <span className="text-sm text-dark-500">{app.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group">
          <Search className="w-6 h-6 text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-white">Search Jobs</p>
          <p className="text-sm text-dark-400">Find new opportunities</p>
        </button>
        <button className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-left group">
          <FileText className="w-6 h-6 text-accent-400 mb-2 group-hover:scale-110 transition-transform" />
          <p className="font-medium text-white">Update Profile</p>
          <p className="text-sm text-dark-400">Keep your info current</p>
        </button>
      </div>
    </div>
  );
}

export default function TestPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.username || 'User'}</span>
          </h1>
          <p className="text-dark-400 mt-1">Here's what's happening with your job search</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </button>
          <button className="btn-primary">
            <Search className="w-4 h-4 mr-2" />
            Find Jobs
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={FileText}
          label="Total Applications"
          value="24"
          trend="12"
          trendUp
        />
        <StatsCard
          icon={TrendingUp}
          label="Interviews"
          value="5"
          trend="25"
          trendUp
        />
        <StatsCard
          icon={Briefcase}
          label="Saved Jobs"
          value="18"
        />
        <StatsCard
          icon={Users}
          label="Profile Views"
          value="142"
          trend="8"
          trendUp
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications - 2 columns */}
        <div className="lg:col-span-2">
          <RecentApplications />
        </div>

        {/* Quick Actions - 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Demo Components Section */}
      <div className="pt-8 border-t border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Component Showcase</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buttons Demo */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button label="Primary" />
              <Button variant="secondary" label="Secondary" />
              <Button variant="warning" label="Warning" />
              <Button variant="destructive" label="Danger" />
              <Button disabled label="Disabled" />
            </div>
          </div>

          {/* Tags Demo */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              <Tag label="React" />
              <Tag label="TypeScript" variant="primary" />
              <Tag label="Premium" variant="success" />
              <Tag label="Urgent" variant="warning" />
              <Tag label="Closed" variant="danger" />
            </div>
          </div>

          {/* Input Demo */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Inputs</h3>
            <div className="space-y-4">
              <Input
                label="Normal Input"
                placeholder="Type something..."
                className="bg-white/5 border-white/10 text-white placeholder:text-dark-400"
              />
              <Input
                label="With Error"
                error="This field is required"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Modal Demo */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">Modal</h3>
            <Button label="Open Modal" onClick={() => setModalOpen(true)} />
            {modalOpen && (
              <Modal
                title="Sample Modal"
                onClose={() => setModalOpen(false)}
                footer={
                  <>
                    <Button
                      variant="secondary"
                      label="Cancel"
                      onClick={() => setModalOpen(false)}
                    />
                    <Button label="Confirm" onClick={() => setModalOpen(false)} />
                  </>
                }
              >
                <p className="text-dark-300">
                  This is a sample modal dialog. You can put any content here.
                </p>
              </Modal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
