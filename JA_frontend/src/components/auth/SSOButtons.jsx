/**
 * SSO Authentication Buttons
 * Google OAuth integration using Google Identity Services (GIS) for Level Ultimo requirement
 * 
 * Architecture: Requirement 1.3.1 (Ultimo) - SSO via Google
 * 
 * This component uses the official Google Sign-In button rendered by GIS,
 * which is more reliable than custom buttons, especially on localhost.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import useGoogleIdentity from '../../hooks/useGoogleIdentity';
import { useAuth } from '../../context/AuthContext';

/**
 * Google SSO Button Component using Google Identity Services
 * Uses the official Google-rendered button for maximum compatibility
 */
export function GoogleSSOButton({
  onSuccess,
  onError,
  disabled = false,
  className = '',
}) {
  const buttonContainerRef = useRef(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [buttonRendered, setButtonRendered] = useState(false);
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

  // Render official Google button when GIS is loaded
  useEffect(() => {
    if (isLoaded && buttonContainerRef.current && !buttonRendered && !disabled) {
      console.log('Rendering Google Sign-In button...');
      renderButton(buttonContainerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 400,
      });
      setButtonRendered(true);
    }
  }, [isLoaded, renderButton, buttonRendered, disabled]);

  // Reset button rendered state when disabled changes
  useEffect(() => {
    if (disabled) {
      setButtonRendered(false);
    }
  }, [disabled]);

  const showError = localError || gisError;
  const isDisabled = disabled || localLoading;

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

  return (
    <div className={className}>
      {/* Loading overlay */}
      {(localLoading || gisLoading) && (
        <div className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-dark-600 bg-dark-700">
          <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
          <span className="text-dark-300">Signing in with Google...</span>
        </div>
      )}

      {/* Google button container - hide when loading */}
      <div
        ref={buttonContainerRef}
        className={`
          w-full flex items-center justify-center
          ${(localLoading || gisLoading || isDisabled) ? 'hidden' : ''}
          ${!isLoaded ? 'min-h-[44px] bg-dark-700/50 rounded-xl animate-pulse' : ''}
        `}
        style={{ minHeight: isLoaded ? 'auto' : '44px' }}
      />

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
 * SSO Buttons Group Component
 * Renders all available SSO providers
 */
export function SSOButtonsGroup({
  onSuccess,
  onError,
  disabled = false,
  loading = null, // Kept for backwards compatibility
}) {
  return (
    <div className="space-y-3">
      <GoogleSSOButton
        onSuccess={onSuccess}
        onError={onError}
        disabled={disabled || loading === 'google'}
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
    return (
      <GoogleSSOButton
        disabled={disabled || loading}
        onSuccess={() => onClick && onClick()}
      />
    );
  }

  return null;
}

export default SSOButtonsGroup;
