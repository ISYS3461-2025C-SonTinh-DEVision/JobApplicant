/**
 * SSO Authentication Buttons
 * Google OAuth integration using Google Identity Services (GIS) for Level Ultimo requirement
 * 
 * Architecture: Requirement 1.3.1 (Ultimo) - SSO via Google
 * 
 * Design Pattern: Custom button as visual proxy for the hidden official Google button
 * This approach combines:
 * - Beautiful custom styling that matches our design system
 * - Reliable GIS ID Token flow (no FedCM issues)
 * - Google branding guidelines compliance
 * 
 * @see https://developers.google.com/identity/gsi/web/guides/offerings
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import useGoogleIdentity from '../../hooks/useGoogleIdentity';
import { useAuth } from '../../context/AuthContext';

// Official Google "G" logo SVG
const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

/**
 * Google SSO Button Component using Google Identity Services
 * 
 * Uses a "proxy button" pattern:
 * 1. Renders a hidden official Google button (for reliable ID token flow)
 * 2. Shows a beautiful custom button that triggers the hidden one
 * 3. Best of both worlds: custom styling + reliable authentication
 */
export function GoogleSSOButton({
  onSuccess,
  onError,
  disabled = false,
  className = '',
  variant = 'default', // 'default' | 'outline' | 'dark'
}) {
  const hiddenButtonRef = useRef(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isButtonReady, setIsButtonReady] = useState(false);
  const { loginWithGoogleIdToken } = useAuth();

  // Handle successful Google credential response
  const handleGoogleSuccess = useCallback(async (idToken) => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      console.log('Processing Google SSO login...');
      const result = await loginWithGoogleIdToken(idToken);

      if (result.success) {
        console.log('Google SSO login successful');
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        const errorMsg = result.message || 'Google login failed';
        console.error('Google SSO login failed:', errorMsg);
        setLocalError(errorMsg);
        if (onError) {
          onError(new Error(errorMsg));
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Google login failed';
      console.error('Google SSO login error:', err);
      setLocalError(errorMsg);
      if (onError) {
        onError(err);
      }
    } finally {
      setLocalLoading(false);
    }
  }, [loginWithGoogleIdToken, onSuccess, onError]);

  // Handle Google error
  const handleGoogleError = useCallback((err) => {
    console.error('Google Identity error:', err);
    setLocalLoading(false);
    setLocalError(err.message);
    if (onError) {
      onError(err);
    }
  }, [onError]);

  // Initialize Google Identity hook
  const {
    isLoaded,
    isLoading: gisLoading,
    error: gisError,
    isConfigured,
    renderButton,
  } = useGoogleIdentity({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  // Render hidden Google button when GIS is loaded
  useEffect(() => {
    if (isLoaded && hiddenButtonRef.current && !isButtonReady) {
      console.log('Rendering hidden Google button for proxy pattern...');
      renderButton(hiddenButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 300,
      });
      setIsButtonReady(true);
    }
  }, [isLoaded, renderButton, isButtonReady]);

  // Click the hidden Google button when custom button is clicked
  const handleCustomButtonClick = useCallback(() => {
    if (disabled || localLoading || gisLoading) return;

    // Find and click the actual Google button inside the hidden container
    const googleButton = hiddenButtonRef.current?.querySelector('div[role="button"]');
    if (googleButton) {
      console.log('Triggering Google Sign-In via proxy button...');
      googleButton.click();
    } else {
      // Fallback: try clicking any clickable element in the container
      const anyButton = hiddenButtonRef.current?.querySelector('iframe');
      if (anyButton) {
        // For iframe-based buttons, we need to focus and simulate click
        setLocalError('Please use the Google button directly');
      } else {
        setLocalError('Google Sign-In not ready. Please refresh the page.');
      }
    }
  }, [disabled, localLoading, gisLoading]);

  const isDisabled = disabled || localLoading || gisLoading;
  const showError = localError || gisError;

  // Not configured - show warning
  if (!isConfigured) {
    return (
      <div className={className}>
        <div className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Google SSO not configured</span>
        </div>
        <p className="text-xs text-amber-400 mt-2 text-center">
          Please set REACT_APP_GOOGLE_CLIENT_ID in .env file
        </p>
      </div>
    );
  }

  // Button variant styles
  const variantStyles = {
    default: `
      bg-white hover:bg-gray-50 
      text-gray-700 
      border border-gray-300 hover:border-gray-400
      shadow-sm hover:shadow-md
    `,
    outline: `
      bg-transparent hover:bg-white/5
      text-white
      border border-white/20 hover:border-white/40
    `,
    dark: `
      bg-dark-700 hover:bg-dark-600
      text-white
      border border-dark-600 hover:border-dark-500
    `,
  };

  return (
    <div className={className}>
      {/* Hidden container for the real Google button */}
      <div
        ref={hiddenButtonRef}
        className="absolute opacity-0 pointer-events-none overflow-hidden"
        style={{ width: '1px', height: '1px', position: 'absolute', left: '-9999px' }}
        aria-hidden="true"
      />

      {/* Beautiful custom button */}
      <button
        type="button"
        onClick={handleCustomButtonClick}
        disabled={isDisabled || !isLoaded}
        className={`
          w-full flex items-center justify-center gap-3 
          px-6 py-3.5 rounded-xl 
          font-medium text-base
          transition-all duration-200 ease-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-[0.98]
          ${variantStyles[variant]}
        `}
      >
        {localLoading || gisLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : !isLoaded ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <GoogleLogo />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Error message */}
      {showError && !localLoading && (
        <p className="text-xs text-red-400 mt-2 flex items-center justify-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {showError}
        </p>
      )}
    </div>
  );
}

/**
 * Alternative: Direct Google Button (uses Google's official rendered button)
 * Use this if you prefer the official Google styling
 */
export function GoogleOfficialButton({
  onSuccess,
  onError,
  disabled = false,
  className = '',
  theme = 'outline', // 'outline' | 'filled_blue' | 'filled_black'
}) {
  const buttonContainerRef = useRef(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [buttonRendered, setButtonRendered] = useState(false);
  const { loginWithGoogleIdToken } = useAuth();

  const handleGoogleSuccess = useCallback(async (idToken) => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const result = await loginWithGoogleIdToken(idToken);
      if (result.success) {
        onSuccess?.(result);
      } else {
        setLocalError(result.message || 'Login failed');
        onError?.(new Error(result.message));
      }
    } catch (err) {
      setLocalError(err.message);
      onError?.(err);
    } finally {
      setLocalLoading(false);
    }
  }, [loginWithGoogleIdToken, onSuccess, onError]);

  const { isLoaded, error: gisError, isConfigured, renderButton } = useGoogleIdentity({
    onSuccess: handleGoogleSuccess,
    onError,
  });

  useEffect(() => {
    if (isLoaded && buttonContainerRef.current && !buttonRendered && !disabled) {
      renderButton(buttonContainerRef.current, {
        theme,
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 400,
      });
      setButtonRendered(true);
    }
  }, [isLoaded, renderButton, buttonRendered, disabled, theme]);

  if (!isConfigured) {
    return (
      <div className={`${className} text-center`}>
        <p className="text-amber-400 text-sm">Google SSO not configured</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {localLoading && (
        <div className="flex items-center justify-center gap-2 py-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
          <span className="text-dark-300">Signing in...</span>
        </div>
      )}
      <div
        ref={buttonContainerRef}
        className={`w-full flex justify-center ${localLoading ? 'hidden' : ''}`}
      />
      {(localError || gisError) && (
        <p className="text-xs text-red-400 mt-2 text-center">{localError || gisError}</p>
      )}
    </div>
  );
}

/**
 * SSO Buttons Group Component
 * Renders all available SSO providers
 */
export function SSOButtonsGroup({
  onSuccess,
  onError,
  disabled = false,
  loading = null,
  variant = 'default',
}) {
  return (
    <div className="space-y-3">
      <GoogleSSOButton
        onSuccess={onSuccess}
        onError={onError}
        disabled={disabled || loading === 'google'}
        variant={variant}
      />
    </div>
  );
}

/**
 * Divider with text
 */
export function OrDivider({ text = 'or continue with email' }) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-dark-900 text-dark-400">{text}</span>
      </div>
    </div>
  );
}

// Legacy exports for backwards compatibility
export function SSOButton({ provider, onClick, disabled, loading }) {
  console.warn('SSOButton is deprecated. Use GoogleSSOButton instead.');
  if (provider === 'google') {
    return <GoogleSSOButton disabled={disabled || loading} onSuccess={onClick} />;
  }
  return null;
}

export default SSOButtonsGroup;
