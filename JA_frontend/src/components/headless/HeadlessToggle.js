/**
 * HeadlessToggle Hook
 * 
 * Manages on/off state with optional localStorage persistence.
 * Perfect for sidebar collapse, accordion panels, feature toggles, etc.
 * 
 * Architecture: A.3.a (Ultimo) - Headless UI pattern
 * 
 * Usage:
 * const { isOn, toggle, turnOn, turnOff } = useHeadlessToggle({
 *   initialValue: false,
 *   storageKey: 'sidebar-collapsed'
 * });
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * @param {Object} options
 * @param {boolean} [options.initialValue=false] - Initial toggle state
 * @param {string} [options.storageKey] - localStorage key for persistence
 * @param {Function} [options.onChange] - Callback when state changes
 */
export default function useHeadlessToggle({
    initialValue = false,
    storageKey = null,
    onChange = null,
} = {}) {
    // Initialize from localStorage if storageKey provided
    const getInitialValue = useCallback(() => {
        if (storageKey && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored !== null) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Failed to parse localStorage value:', e);
            }
        }
        return initialValue;
    }, [storageKey, initialValue]);

    const [isOn, setIsOn] = useState(getInitialValue);

    // Persist to localStorage when state changes
    useEffect(() => {
        if (storageKey && typeof window !== 'undefined') {
            try {
                localStorage.setItem(storageKey, JSON.stringify(isOn));
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
            }
        }
    }, [isOn, storageKey]);

    // Call onChange when state changes
    useEffect(() => {
        onChange?.(isOn);
    }, [isOn, onChange]);

    // Toggle state
    const toggle = useCallback(() => {
        setIsOn(prev => !prev);
    }, []);

    // Turn on
    const turnOn = useCallback(() => {
        setIsOn(true);
    }, []);

    // Turn off
    const turnOff = useCallback(() => {
        setIsOn(false);
    }, []);

    // Set specific value
    const setValue = useCallback((value) => {
        setIsOn(Boolean(value));
    }, []);

    // Get button props for toggle trigger
    const getToggleButtonProps = useCallback((props = {}) => ({
        role: 'switch',
        'aria-checked': isOn,
        onClick: (e) => {
            toggle();
            props.onClick?.(e);
        },
        ...props,
    }), [isOn, toggle]);

    return {
        // State
        isOn,
        isOff: !isOn,

        // Actions
        toggle,
        turnOn,
        turnOff,
        setValue,

        // Props helpers
        getToggleButtonProps,
    };
}
