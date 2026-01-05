/**
 * useGoogleIdentity Hook
 * 
 * Custom hook for Google Identity Services (GIS) integration.
 * Provides Google SSO functionality using ID Token Flow.
 * 
 * Architecture: Requirement 1.3.1 (Ultimo) - SSO via Google
 * 
 * Flow:
 * 1. Initialize GIS with client ID
 * 2. User clicks Google Sign-In button (rendered by GIS)
 * 3. GIS returns ID token via callback
 * 4. Hook provides the token to calling component
 * 
 * Note: FedCM is disabled for localhost compatibility
 * 
 * @see https://developers.google.com/identity/gsi/web/guides/overview
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Google Identity Services client ID from environment
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

/**
 * Hook for Google Identity Services integration
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback when login succeeds with ID token
 * @param {Function} options.onError - Callback when login fails
 * @param {boolean} options.autoPrompt - Whether to show One Tap prompt automatically
 * @returns {Object} Google Identity state and methods
 */
export default function useGoogleIdentity({
    onSuccess,
    onError,
    autoPrompt = false,
} = {}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const buttonContainerRef = useRef(null);
    const isInitialized = useRef(false);

    /**
     * Handle credential response from Google
     */
    const handleCredentialResponse = useCallback((response) => {
        setIsLoading(false);
        setError(null);

        if (response.credential) {
            // ID token received successfully
            console.log('Google ID token received');
            if (onSuccess) {
                onSuccess(response.credential);
            }
        } else {
            const errorMsg = 'No credential received from Google';
            console.error(errorMsg);
            setError(errorMsg);
            if (onError) {
                onError(new Error(errorMsg));
            }
        }
    }, [onSuccess, onError]);

    /**
     * Initialize Google Identity Services
     */
    useEffect(() => {
        // Check if Google client ID is configured
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
            console.warn('Google Client ID not configured. SSO will not work.');
            setError('Google SSO not configured');
            return;
        }

        // Check if GIS script is loaded
        const checkGoogleLoaded = () => {
            return !!(window.google?.accounts?.id);
        };

        // Initialize GIS when script loads
        const initializeGIS = () => {
            if (isInitialized.current) return;

            try {
                console.log('Initializing Google Identity Services with client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    context: 'signin',
                    ux_mode: 'popup',
                    // Disable FedCM to avoid issues on localhost
                    use_fedcm_for_prompt: false,
                });

                isInitialized.current = true;
                setIsLoaded(true);
                setError(null);
                console.log('Google Identity Services initialized successfully');

                // Show One Tap prompt if autoPrompt is enabled
                if (autoPrompt) {
                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed()) {
                            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
                        }
                        if (notification.isSkippedMoment()) {
                            console.log('One Tap skipped:', notification.getSkippedReason());
                        }
                    });
                }
            } catch (err) {
                console.error('Failed to initialize Google Identity Services:', err);
                setError('Failed to initialize Google Sign-In');
                if (onError) {
                    onError(err);
                }
            }
        };

        // Poll for GIS script to load
        if (checkGoogleLoaded()) {
            initializeGIS();
        } else {
            const interval = setInterval(() => {
                if (checkGoogleLoaded()) {
                    clearInterval(interval);
                    initializeGIS();
                }
            }, 100);

            // Cleanup interval after 10 seconds (script should load by then)
            const timeout = setTimeout(() => {
                clearInterval(interval);
                if (!isInitialized.current) {
                    setError('Google Sign-In script failed to load');
                }
            }, 10000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [handleCredentialResponse, onError, autoPrompt]);

    /**
     * Render Google Sign-In button in the given container
     * This uses the official Google-rendered button which is more reliable
     * @param {HTMLElement} container - DOM element to render button in
     * @param {Object} options - Button customization options
     */
    const renderButton = useCallback((container, options = {}) => {
        if (!isLoaded || !window.google?.accounts?.id) {
            console.warn('Google Identity Services not loaded yet');
            return;
        }

        if (!container) {
            console.warn('No container provided for Google button');
            return;
        }

        try {
            console.log('Rendering Google Sign-In button');
            window.google.accounts.id.renderButton(container, {
                type: options.type || 'standard',
                theme: options.theme || 'outline',
                size: options.size || 'large',
                text: options.text || 'continue_with',
                shape: options.shape || 'rectangular',
                logo_alignment: options.logoAlignment || 'left',
                width: options.width || 400,
                locale: options.locale || undefined,
            });
        } catch (err) {
            console.error('Failed to render Google button:', err);
            setError('Failed to render Google Sign-In button');
        }
    }, [isLoaded]);

    /**
     * Trigger Google Sign-In prompt manually (One Tap)
     * Note: This may not work on localhost due to FedCM/browser restrictions
     * Use renderButton instead for reliable sign-in
     */
    const promptSignIn = useCallback(() => {
        if (!isLoaded) {
            setError('Google Sign-In not ready');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    setIsLoading(false);
                    const reason = notification.getNotDisplayedReason();
                    console.warn('One Tap not displayed:', reason);
                    // Common reasons: opt_out_or_no_session, suppressed_by_user, browser_not_supported
                    setError('One Tap unavailable. Please use the Google button.');
                }
                if (notification.isSkippedMoment()) {
                    setIsLoading(false);
                    console.log('One Tap skipped:', notification.getSkippedReason());
                }
                if (notification.isDismissedMoment()) {
                    setIsLoading(false);
                    const reason = notification.getDismissedReason();
                    if (reason === 'credential_returned') {
                        // Success - credential was returned via callback
                    } else {
                        console.log('One Tap dismissed:', reason);
                    }
                }
            });
        } catch (err) {
            setIsLoading(false);
            console.error('Failed to show Google Sign-In prompt:', err);
            setError('Failed to show Google Sign-In');
            if (onError) {
                onError(err);
            }
        }
    }, [isLoaded, onError]);

    /**
     * Cancel any pending Google operation
     */
    const cancel = useCallback(() => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.cancel();
        }
        setIsLoading(false);
    }, []);

    /**
     * Revoke Google credential (for logout)
     * @param {string} email - User's email to revoke
     */
    const revoke = useCallback((email) => {
        if (window.google?.accounts?.id && email) {
            window.google.accounts.id.revoke(email, (response) => {
                if (response.error) {
                    console.warn('Failed to revoke Google credential:', response.error);
                }
            });
        }
    }, []);

    return {
        // State
        isLoaded,
        isLoading,
        error,
        isConfigured: !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here',

        // Methods
        renderButton,
        promptSignIn,
        cancel,
        revoke,

        // Ref for button container
        buttonContainerRef,
    };
}
