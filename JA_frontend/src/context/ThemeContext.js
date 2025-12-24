/**
 * Theme Context
 * 
 * Provides light/dark mode functionality across the application.
 * - Persists user preference in localStorage
 * - Auto-detects system preference on first visit
 * - Applies theme class to document root
 * 
 * Architecture: Context-based state management for global theme
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Theme constants
const THEME_KEY = 'devision_theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
};

// Create context
const ThemeContext = createContext(null);

/**
 * Get initial theme from localStorage or system preference
 */
function getInitialTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return THEMES.LIGHT;
    }

    // Default to dark (matches current design)
    return THEMES.DARK;
}

/**
 * Theme Provider Component
 */
export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitialTheme);
    const [mounted, setMounted] = useState(false);

    // Apply theme class to document
    useEffect(() => {
        setMounted(true);
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove('theme-light', 'theme-dark');

        // Add current theme class
        root.classList.add(`theme-${theme}`);

        // Also set data attribute for CSS targeting
        root.setAttribute('data-theme', theme);

        // Save to localStorage
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

        const handleChange = (e) => {
            // Only auto-switch if user hasn't explicitly set a preference
            const savedTheme = localStorage.getItem(THEME_KEY);
            if (!savedTheme) {
                setThemeState(e.matches ? THEMES.LIGHT : THEMES.DARK);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Set theme
    const setTheme = useCallback((newTheme) => {
        if (Object.values(THEMES).includes(newTheme)) {
            setThemeState(newTheme);
        }
    }, []);

    // Toggle between themes
    const toggleTheme = useCallback(() => {
        setThemeState(prev => prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
    }, []);

    // Check if current theme is dark
    const isDark = theme === THEMES.DARK;

    // Context value
    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark,
        isLight: !isDark,
        mounted,
        THEMES,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * useTheme Hook
 * Access theme state and controls from any component
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
