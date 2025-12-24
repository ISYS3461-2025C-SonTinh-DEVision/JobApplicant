/**
 * Coming Soon Page Component
 * 
 * Beautiful placeholder page for features under development.
 * Supports light/dark mode and responsive design.
 * 
 * Architecture: A.2.a - Reusable configurable component
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Feature card for "What's Coming" section
 */
function FeatureCard({ icon: Icon, title, description }) {
    const { isDark } = useTheme();

    return (
        <div className={`p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${isDark
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary-400" />
            </div>
            <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
            </h3>
            <p className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-600'}`}>
                {description}
            </p>
        </div>
    );
}

/**
 * Coming Soon Page
 * @param {Object} props
 * @param {string} props.featureName - Name of the feature (e.g., "Job Search")
 * @param {string} props.description - Description of what's coming
 * @param {React.ComponentType} props.icon - Icon component to display
 * @param {Array} props.features - List of upcoming features to show
 */
export default function ComingSoon({
    featureName = 'This Feature',
    description = 'We\'re working hard to bring you something amazing. Stay tuned!',
    icon: IconComponent = Construction,
    features = []
}) {
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const defaultFeatures = [
        {
            icon: Sparkles,
            title: 'Coming Soon',
            description: 'This feature is currently under development.'
        }
    ];

    const displayFeatures = features.length > 0 ? features : defaultFeatures;

    return (
        <div className="max-w-2xl mx-auto text-center py-12">
            {/* Back Button */}
            <button
                onClick={() => navigate('/dashboard')}
                className={`inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg transition-colors ${isDark
                        ? 'text-dark-400 hover:text-white hover:bg-dark-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
            </button>

            {/* Main Icon */}
            <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <IconComponent className="w-12 h-12 text-primary-400" />
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-primary-500/30 animate-ping" />
                </div>
            </div>

            {/* Title & Description */}
            <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {featureName}
            </h1>
            <p className={`text-lg mb-8 max-w-md mx-auto ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                {description}
            </p>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-12 ${isDark
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Under Development</span>
            </div>

            {/* Features Preview */}
            {displayFeatures.length > 0 && (
                <div className="mb-12">
                    <h2 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        What's Coming
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayFeatures.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-primary px-6 py-3"
                >
                    Return to Dashboard
                </button>
                <button
                    onClick={() => {
                        // Future: implement notification signup
                        alert('📬 Notification feature coming soon!');
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border transition-colors ${isDark
                            ? 'border-white/20 text-white hover:bg-white/10'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    <Bell className="w-4 h-4" />
                    <span>Notify Me</span>
                </button>
            </div>
        </div>
    );
}
