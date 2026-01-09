/**
 * Appearance Settings Component
 * 
 * Theme and display preferences.
 * Integrates with ThemeContext for light/dark mode.
 * 
 * Architecture: A.3.a (Ultimo Frontend)
 */

import React, { useState } from 'react';
import { Sun, Moon, Monitor, Sparkles, Check, Eye, Maximize2 } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';

export default function AppearanceSettings() {
    const { isDark, theme, setTheme, toggleTheme, THEMES } = useTheme();
    const [animations, setAnimations] = useState(true);
    const [compactMode, setCompactMode] = useState(false);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const borderColor = isDark ? 'border-dark-700' : 'border-gray-200';
    const cardBg = isDark ? 'bg-dark-700/50' : 'bg-gray-50';

    const themeOptions = [
        { id: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
        { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    ];

    return (
        <div className="space-y-8">
            {/* Theme Selection */}
            <div>
                <h3 className={`font-semibold mb-4 ${textPrimary}`}>Theme</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {themeOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = theme === option.id;
                        return (
                            <button
                                key={option.id}
                                onClick={() => setTheme(option.id)}
                                className={`
                                    relative p-4 rounded-xl border-2 transition-all duration-200
                                    ${isSelected
                                        ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                                        : `border-transparent ${cardBg} hover:border-primary-500/30`
                                    }
                                `}
                            >
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <div className="p-1 rounded-full bg-primary-500">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                )}
                                <div className={`
                                    w-full aspect-video rounded-lg mb-4 flex items-center justify-center
                                    ${option.id === 'dark'
                                        ? 'bg-gradient-to-br from-dark-900 to-dark-800'
                                        : 'bg-gradient-to-br from-white to-gray-100 border border-gray-200'
                                    }
                                `}>
                                    <Icon className={`w-8 h-8 ${option.id === 'dark' ? 'text-primary-400' : 'text-yellow-500'}`} />
                                </div>
                                <div className="text-left">
                                    <p className={`font-medium ${textPrimary}`}>{option.label}</p>
                                    <p className={`text-sm ${textSecondary}`}>{option.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Animation Settings */}
            <div>
                <h3 className={`font-semibold mb-4 ${textPrimary}`}>Effects</h3>
                <div className={`rounded-xl border ${borderColor} divide-y ${isDark ? 'divide-dark-700' : 'divide-gray-100'}`}>
                    {/* Animations Toggle */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                                <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                            </div>
                            <div>
                                <p className={`font-medium ${textPrimary}`}>Animations</p>
                                <p className={`text-sm ${textSecondary}`}>Enable smooth transitions and effects</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAnimations(!animations)}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                ${animations ? 'bg-primary-500' : isDark ? 'bg-dark-600' : 'bg-gray-300'}
                            `}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${animations ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Compact Mode Toggle */}
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                                <Maximize2 className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                            </div>
                            <div>
                                <p className={`font-medium ${textPrimary}`}>Compact Mode</p>
                                <p className={`text-sm ${textSecondary}`}>Reduce spacing for denser content</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCompactMode(!compactMode)}
                            className={`
                                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                ${compactMode ? 'bg-primary-500' : isDark ? 'bg-dark-600' : 'bg-gray-300'}
                            `}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Card */}
            <div>
                <h3 className={`font-semibold mb-4 ${textPrimary}`}>Preview</h3>
                <div className={`p-6 rounded-xl border ${borderColor} ${cardBg}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'} flex items-center justify-center`}>
                            <Eye className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <p className={`font-medium ${textPrimary}`}>Live Preview</p>
                            <p className={`text-sm ${textSecondary}`}>
                                Currently viewing in {theme === 'dark' ? 'Dark' : 'Light'} mode
                            </p>
                        </div>
                    </div>
                    <div className={`mt-4 grid grid-cols-3 gap-2`}>
                        {['Primary', 'Success', 'Warning'].map((color, i) => (
                            <div
                                key={color}
                                className={`
                                    py-2 px-3 rounded-lg text-center text-sm font-medium
                                    ${i === 0 ? 'bg-primary-500 text-white' : ''}
                                    ${i === 1 ? 'bg-green-500 text-white' : ''}
                                    ${i === 2 ? 'bg-yellow-500 text-white' : ''}
                                `}
                            >
                                {color}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
