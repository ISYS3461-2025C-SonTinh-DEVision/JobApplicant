/**
 * Security Settings Page
 * 
 * Allows users to change their email and password with enhanced security:
 * - Password change with success modal and auto-redirect to login
 * - Email change with multi-step OTP verification (current email → new email)
 * 
 * Requirement 3.1.1: Job Applicants shall be able to edit their Email and Password
 * 
 * Architecture:
 * - A.3.a: Uses Headless UI hooks (useHeadlessForm, useHeadlessModal)
 * - A.2.a: Uses reusable FormInput components
 * - Full client-side validation
 * - SSO user detection (Google users cannot change password/email)
 * - Light/Dark mode support via ThemeContext
 * - Multi-step OTP verification flow for email change
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Lock, Mail, Shield, Eye, EyeOff, Loader2,
    CheckCircle, AlertCircle, AlertTriangle, Info, Unlock,
    Send, KeyRound, ArrowRight, PartyPopper, Clipboard, ExternalLink
} from 'lucide-react';
import AuthService from '../../services/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useHeadlessForm, useHeadlessModal } from '../../components/headless';
import { FormInput } from '../../components/reusable';
import useGoogleIdentity from '../../hooks/useGoogleIdentity';

// ==================== VALIDATION FUNCTIONS ====================

const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('At least 1 lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('At least 1 number');
    if (!/[@#$%^&+=!]/.test(password)) errors.push('At least 1 special character');
    return errors;
};

const validatePasswordForm = (values) => {
    const errors = {};
    if (!values.currentPassword) errors.currentPassword = 'Current password is required';
    if (!values.newPassword) {
        errors.newPassword = 'New password is required';
    } else {
        const pwdErrors = validatePassword(values.newPassword);
        if (pwdErrors.length > 0) errors.newPassword = pwdErrors[0];
    }
    if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
    } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
};

const validateEmailForm = (values) => {
    const errors = {};
    if (!values.newEmail) {
        errors.newEmail = 'New email is required';
    } else if (!values.newEmail.includes('@') || !/\.[a-zA-Z]{2,}$/.test(values.newEmail)) {
        errors.newEmail = 'Invalid email format';
    } else if (values.newEmail.length > 254) {
        errors.newEmail = 'Email too long';
    }
    if (!values.password) errors.password = 'Password required for verification';
    return errors;
};

// Validation for SSO users setting their first password (no current password required)
const validateSetPasswordForm = (values) => {
    const errors = {};
    if (!values.newPassword) {
        errors.newPassword = 'Password is required';
    } else {
        const pwdErrors = validatePassword(values.newPassword);
        if (pwdErrors.length > 0) errors.newPassword = pwdErrors[0];
    }
    if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
};

// ==================== SUBCOMPONENTS ====================

const PasswordStrengthIndicator = ({ password, isDark }) => {
    const requirements = [
        { test: password.length >= 8, label: '8+ chars' },
        { test: /[A-Z]/.test(password), label: 'Uppercase' },
        { test: /[a-z]/.test(password), label: 'Lowercase' },
        { test: /[0-9]/.test(password), label: 'Number' },
        { test: /[@#$%^&+=!]/.test(password), label: 'Special' },
    ];
    const passedCount = requirements.filter(r => r.test).length;
    const percent = (passedCount / requirements.length) * 100;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                    <div
                        className={`h-full transition-all duration-300 ${percent <= 40 ? 'bg-red-500' : percent <= 60 ? 'bg-yellow-500' : percent <= 80 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <span className={`text-xs font-medium ${percent <= 40 ? 'text-red-400' : percent <= 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {percent <= 40 ? 'Weak' : percent <= 80 ? 'Good' : 'Strong'}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
                {requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-1">
                        {req.test ? <CheckCircle className="w-3 h-3 text-green-400" /> : <div className={`w-3 h-3 rounded-full border ${isDark ? 'border-dark-500' : 'border-gray-300'}`} />}
                        <span className={`text-xs ${req.test ? 'text-green-400' : isDark ? 'text-dark-400' : 'text-gray-400'}`}>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LockedOverlay = ({ icon: Icon, title, description, onUnlock, isDark }) => (
    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] rounded-2xl">
        <div className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-dark-900/80' : 'bg-gray-100/80'}`} />
        <div className="relative z-20 text-center p-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform hover:scale-105 ${isDark ? 'bg-primary-500/20 border border-primary-500/30' : 'bg-primary-50 border border-primary-200'}`}>
                <Icon className={`w-7 h-7 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            <p className={`text-sm mb-4 max-w-xs mx-auto ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{description}</p>
            <button onClick={onUnlock} className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg ${isDark ? 'shadow-primary-500/25' : 'shadow-primary-500/30'}`}>
                <Unlock className="w-4 h-4" /> Unlock to Edit
            </button>
        </div>
    </div>
);

/**
 * Enhanced OTP Input with Paste Button and Auto-Verify
 */
const OtpInputField = ({ value, onChange, onVerify, isVerifying, disabled, isDark }) => {
    const inputRef = useRef(null);
    const [pasting, setPasting] = useState(false);

    const handleChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        onChange(val);
        // Auto-verify when 6 digits entered
        if (val.length === 6 && onVerify) {
            setTimeout(() => onVerify(val), 100);
        }
    };

    const handlePaste = async () => {
        try {
            setPasting(true);
            const text = await navigator.clipboard.readText();
            const digits = text.replace(/\D/g, '').slice(0, 6);
            if (digits.length > 0) {
                onChange(digits);
                // Auto-verify when 6 digits pasted
                if (digits.length === 6 && onVerify) {
                    setTimeout(() => onVerify(digits), 100);
                }
            }
        } catch (err) {
            console.error('Failed to paste:', err);
        } finally {
            setPasting(false);
        }
    };

    const handleKeyDown = (e) => {
        // Handle Ctrl+V / Cmd+V paste
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            // Let the browser handle paste, then check value
        }
    };

    return (
        <div className="space-y-3">
            <label className={`block text-sm font-medium mb-2 text-center ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>
                Enter 6-digit code
            </label>

            {/* OTP Display */}
            <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-11 h-14 flex items-center justify-center rounded-xl text-2xl font-bold border-2 transition-all ${value[i]
                            ? (isDark ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-primary-500 bg-primary-50 text-primary-600')
                            : (isDark ? 'border-dark-600 bg-dark-800 text-dark-300' : 'border-gray-300 bg-white text-gray-400')
                            }`}
                    >
                        {value[i] || '•'}
                    </div>
                ))}
            </div>

            {/* Hidden Input */}
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled || isVerifying}
                className={`w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl border-2 ${isDark ? 'bg-dark-800 border-dark-600 text-white focus:border-primary-500' : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'
                    } outline-none`}
                placeholder="000000"
                autoFocus
            />

            {/* Paste Button */}
            <button
                type="button"
                onClick={handlePaste}
                disabled={disabled || isVerifying || pasting}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isDark
                    ? 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white border border-dark-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    } ${(disabled || isVerifying) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {pasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clipboard className="w-4 h-4" />}
                Paste from Clipboard
            </button>
        </div>
    );
};

const SuccessModal = ({ isOpen, onClose, title, message, isDark, countdown }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative z-10 max-w-md w-full p-8 rounded-3xl shadow-2xl animate-scale-in ${isDark ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
                <div className="text-center">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                        <PartyPopper className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                    <p className={`mb-6 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>{message}</p>
                    <div className={`text-sm mb-6 ${isDark ? 'text-dark-500' : 'text-gray-400'}`}>
                        Redirecting to login in <span className="font-bold text-primary-400">{countdown}</span> seconds...
                    </div>
                    <button onClick={onClose} className="btn-primary w-full">
                        Go to Login Now
                    </button>
                </div>
            </div>
        </div>
    );
};

// SSO Verify Button for email change flow
const SsoVerifyButton = ({ onVerify, isLoading, isDark }) => {
    const googleBtnRef = useRef(null);
    const [buttonRendered, setButtonRendered] = useState(false);

    const { isLoaded, isLoading: googleLoading, error, renderButton } = useGoogleIdentity({
        onSuccess: async (idToken) => {
            if (idToken) {
                await onVerify(idToken);
            }
        },
        onError: (err) => {
            console.error('Google SSO verification error:', err);
        },
    });

    // Render Google button when loaded
    useEffect(() => {
        if (isLoaded && googleBtnRef.current && !buttonRendered) {
            renderButton(googleBtnRef.current, {
                type: 'standard',
                theme: isDark ? 'filled_black' : 'outline',
                size: 'large',
                text: 'continue_with',
                width: 300,
            });
            setButtonRendered(true);
        }
    }, [isLoaded, renderButton, buttonRendered, isDark]);

    const handleClick = () => {
        // Trigger the hidden Google button
        const googleBtn = googleBtnRef.current?.querySelector('div[role="button"]');
        if (googleBtn) {
            googleBtn.click();
        }
    };

    return (
        <div className="relative">
            {/* Hidden Google button */}
            <div ref={googleBtnRef} className="opacity-0 absolute pointer-events-none" style={{ width: 0, height: 0, overflow: 'hidden' }} />

            {/* Custom styled button */}
            <button
                onClick={handleClick}
                disabled={!isLoaded || isLoading || googleLoading}
                className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all border ${isDark
                    ? 'bg-dark-700 border-dark-600 text-white hover:bg-dark-600 hover:border-primary-500/50'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-400'
                    } ${(!isLoaded || isLoading || googleLoading) ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Verifying...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Verify with Google</span>
                    </>
                )}
            </button>

            {error && (
                <p className={`mt-2 text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export default function SecuritySettingsPage() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { isDark } = useTheme();

    // Section lock states
    const [passwordLocked, setPasswordLocked] = useState(true);
    const [emailLocked, setEmailLocked] = useState(true);
    const [ssoPasswordLocked, setSsoPasswordLocked] = useState(true); // For SSO users to set password

    // Password form states (for regular users)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Set Password form states (for SSO users)
    const [showSetNewPassword, setShowSetNewPassword] = useState(false);
    const [showSetConfirmPassword, setShowSetConfirmPassword] = useState(false);

    // Email change OTP flow states
    const [emailStep, setEmailStep] = useState(1);
    const [currentEmailOtp, setCurrentEmailOtp] = useState('');
    const [newEmailOtp, setNewEmailOtp] = useState('');
    const [currentEmailVerified, setCurrentEmailVerified] = useState(false);
    const [newEmailVerified, setNewEmailVerified] = useState(false);
    const [otpSending, setOtpSending] = useState(false);
    const [otpVerifying, setOtpVerifying] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [showEmailPassword, setShowEmailPassword] = useState(false);

    // Success modal states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successTitle, setSuccessTitle] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [countdown, setCountdown] = useState(5);

    const [isSsoUser, setIsSsoUser] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    // SSO Email Change via Google Verification states
    const [ssoEmailStep, setSsoEmailStep] = useState(0); // 0: choose method, 1: verify google, 2: enter new email, 3: verify OTP, 4: confirm
    const [ssoVerificationToken, setSsoVerificationToken] = useState('');
    const [ssoEmailVerifying, setSsoEmailVerifying] = useState(false);
    const [ssoNewEmail, setSsoNewEmail] = useState('');
    const [ssoNewEmailOtp, setSsoNewEmailOtp] = useState('');
    const [ssoEmailError, setSsoEmailError] = useState('');
    const [ssoEmailLocked, setSsoEmailLocked] = useState(true);

    // Check if SSO user
    useEffect(() => {
        if (currentUser?.authProvider === 'google') {
            setIsSsoUser(true);
            setIsGoogleUser(true);
        }
    }, [currentUser]);

    // Countdown timer for success modal
    useEffect(() => {
        if (showSuccessModal && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (showSuccessModal && countdown === 0) {
            handleLogoutAndRedirect();
        }
    }, [showSuccessModal, countdown]);

    const handleLogoutAndRedirect = useCallback(async () => {
        await logout();
        navigate('/login');
    }, [logout, navigate]);

    // Password form with Headless UI
    const passwordForm = useHeadlessForm({
        initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
        validate: validatePasswordForm,
        onSubmit: async (values) => {
            const response = await AuthService.changePassword(values.currentPassword, values.newPassword, values.confirmPassword);
            if (response.success) {
                setSuccessTitle('Password Changed! 🎉');
                setSuccessMessage('Your password has been updated successfully. Please log in with your new password.');
                setCountdown(5);
                setShowSuccessModal(true);
                passwordForm.resetForm();
                setPasswordLocked(true);
            } else {
                if (response.isSsoUser) setIsSsoUser(true);
                throw new Error(response.message || 'Failed to change password');
            }
        },
    });

    // Email form with Headless UI
    const emailForm = useHeadlessForm({
        initialValues: { newEmail: '', password: '' },
        validate: validateEmailForm,
        onSubmit: async (values) => {
            const response = await AuthService.changeEmail(values.newEmail, values.password);
            if (response.success) {
                setSuccessTitle('Email Changed! 🎉');
                setSuccessMessage(`Your email has been updated to ${values.newEmail}. Please log in with your new email.`);
                setCountdown(5);
                setShowSuccessModal(true);
                resetEmailFlow();
            } else {
                if (response.isSsoUser) setIsSsoUser(true);
                throw new Error(response.message || 'Failed to change email');
            }
        },
    });

    // Set Password form for SSO users with Headless UI
    const setPasswordForm = useHeadlessForm({
        initialValues: { newPassword: '', confirmPassword: '' },
        validate: validateSetPasswordForm,
        onSubmit: async (values) => {
            const response = await AuthService.setPassword(values.newPassword, values.confirmPassword);
            if (response.success) {
                setSuccessTitle('Password Set Successfully! 🎉');
                setSuccessMessage('Your password has been set. Google login has been disabled. Please log in with your email and new password.');
                setCountdown(5);
                setShowSuccessModal(true);
                setPasswordForm.resetForm();
                setSsoPasswordLocked(true);
            } else {
                throw new Error(response.message || 'Failed to set password');
            }
        },
    });

    // Success modal with Headless UI
    const successModal = useHeadlessModal({
        onClose: () => handleLogoutAndRedirect(),
    });

    const resetEmailFlow = () => {
        setEmailStep(1);
        setCurrentEmailOtp('');
        setNewEmailOtp('');
        setCurrentEmailVerified(false);
        setNewEmailVerified(false);
        setOtpError('');
        emailForm.resetForm();
        setEmailLocked(true);
    };

    // OTP handlers
    const handleSendCurrentEmailOtp = async () => {
        setOtpSending(true);
        setOtpError('');
        try {
            const response = await AuthService.sendOtp(currentUser.email);
            if (!response.success) {
                setOtpError(response.message || 'Failed to send code');
            }
        } catch (err) {
            setOtpError(err.message || 'Failed to send code');
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyCurrentEmailOtp = async (otp = currentEmailOtp) => {
        if (otp.length !== 6) return;
        setOtpVerifying(true);
        setOtpError('');
        try {
            const response = await AuthService.verifyOtp(currentUser.email, otp);
            if (response.success) {
                setCurrentEmailVerified(true);
                setEmailStep(2);
            } else {
                setOtpError(response.message || 'Invalid code');
            }
        } catch (err) {
            setOtpError(err.message || 'Verification failed');
        } finally {
            setOtpVerifying(false);
        }
    };

    const handleSendNewEmailOtp = async () => {
        if (!emailForm.values.newEmail || emailForm.errors.newEmail) return;
        setOtpSending(true);
        setOtpError('');
        try {
            const response = await AuthService.sendOtp(emailForm.values.newEmail);
            if (response.success) {
                setEmailStep(3);
            } else {
                setOtpError(response.message || 'Failed to send code');
            }
        } catch (err) {
            setOtpError(err.message || 'Failed to send code');
        } finally {
            setOtpSending(false);
        }
    };

    const handleVerifyNewEmailOtp = async (otp = newEmailOtp) => {
        if (otp.length !== 6) return;
        setOtpVerifying(true);
        setOtpError('');
        try {
            const response = await AuthService.verifyOtp(emailForm.values.newEmail, otp);
            if (response.success) {
                setNewEmailVerified(true);
                setEmailStep(4);
            } else {
                setOtpError(response.message || 'Invalid code');
            }
        } catch (err) {
            setOtpError(err.message || 'Verification failed');
        } finally {
            setOtpVerifying(false);
        }
    };

    const handleUnlockPassword = () => { setPasswordLocked(false); setEmailLocked(true); setSsoPasswordLocked(true); passwordForm.resetForm(); };
    const handleUnlockEmail = () => {
        setEmailStep(1);
        setCurrentEmailOtp('');
        setNewEmailOtp('');
        setCurrentEmailVerified(false);
        setNewEmailVerified(false);
        setOtpError('');
        emailForm.resetForm();
        setEmailLocked(false);
        setPasswordLocked(true);
        setSsoPasswordLocked(true);
    };
    const handleUnlockSetPassword = () => {
        setSsoPasswordLocked(false);
        setPasswordLocked(true);
        setEmailLocked(true);
        setPasswordForm.resetForm();
    };

    // SSO Email Change Handlers
    const handleUnlockSsoEmail = () => {
        setSsoEmailStep(0);
        setSsoVerificationToken('');
        setSsoNewEmail('');
        setSsoNewEmailOtp('');
        setSsoEmailError('');
        setSsoEmailLocked(false);
        setPasswordLocked(true);
        setSsoPasswordLocked(true);
    };

    const resetSsoEmailFlow = () => {
        setSsoEmailStep(0);
        setSsoVerificationToken('');
        setSsoNewEmail('');
        setSsoNewEmailOtp('');
        setSsoEmailError('');
        setSsoEmailLocked(true);
    };

    // Handle Google verification for SSO email change
    const handleSsoGoogleVerify = async (idToken) => {
        setSsoEmailVerifying(true);
        setSsoEmailError('');
        try {
            const response = await AuthService.verifySsoOwnership(idToken);
            if (response.success) {
                setSsoVerificationToken(response.verificationToken);
                setSsoEmailStep(2); // Move to enter new email step
            } else {
                setSsoEmailError(response.message || 'Failed to verify Google account');
            }
        } catch (err) {
            setSsoEmailError(err.message || 'Failed to verify Google account');
        } finally {
            setSsoEmailVerifying(false);
        }
    };

    // Handle proceeding to confirm step after entering new email (no OTP needed for SSO flow)
    // Since user already verified via Google, we skip OTP and go directly to confirmation
    const handleSsoConfirmNewEmail = () => {
        if (!ssoNewEmail || !ssoNewEmail.includes('@')) {
            setSsoEmailError('Please enter a valid email');
            return;
        }
        if (ssoNewEmail.toLowerCase() === currentUser?.email?.toLowerCase()) {
            setSsoEmailError('New email must be different from current email');
            return;
        }
        setSsoEmailError('');
        setSsoEmailStep(3); // Go directly to confirm step (skip OTP since already verified via Google)
    };

    // Handle final email change in SSO flow
    const handleSsoEmailChange = async () => {
        setSsoEmailVerifying(true);
        setSsoEmailError('');
        try {
            const response = await AuthService.changeEmailSso(ssoNewEmail, ssoVerificationToken);
            if (response.success) {
                setSuccessTitle('Email Changed! 🎉');
                setSuccessMessage(`Your email has been changed to ${ssoNewEmail}. Please log in with your new email.`);
                setCountdown(5);
                setShowSuccessModal(true);
                resetSsoEmailFlow();
            } else {
                setSsoEmailError(response.message || 'Failed to change email');
            }
        } catch (err) {
            setSsoEmailError(err.message || 'Failed to change email');
        } finally {
            setSsoEmailVerifying(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate('/dashboard/profile')} className={`flex items-center gap-2 transition-colors mb-4 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                    <ArrowLeft className="w-4 h-4" /><span>Back to Profile</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                        <Shield className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Security Settings</h1>
                        <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Manage your account security</p>
                    </div>
                </div>
            </div>

            {/* SSO Notice - Helpful guidance for Google SSO users */}
            {isSsoUser && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'}`}>
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            🔐 Google Account Connected
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-blue-400/80' : 'text-blue-600'}`}>
                            You signed in with Google. To enable <strong>email/password login</strong> instead,
                            you can set a password below. This will disable Google SSO for your account.
                        </p>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-dark-800/50 border border-dark-700' : 'bg-gray-50 border border-gray-200'}`}>
                <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                    {isSsoUser
                        ? <>Use <strong>"Set Password"</strong> below to enable email/password login.</>
                        : <>Click <strong>"Unlock to Edit"</strong> to modify a section. Only one section can be edited at a time.</>
                    }
                </p>
            </div>

            <div className="space-y-6">
                {/* ==================== SET PASSWORD SECTION (For SSO Users) ==================== */}
                {isSsoUser && (
                    <div className={`relative p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        {ssoPasswordLocked && (
                            <LockedOverlay
                                icon={KeyRound}
                                title="Set Password"
                                description="Enable email/password login for your account"
                                onUnlock={handleUnlockSetPassword}
                                isDark={isDark}
                            />
                        )}
                        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <KeyRound className="w-5 h-5 text-primary-400" /> Set Password
                            {!ssoPasswordLocked && (
                                <button onClick={() => setSsoPasswordLocked(true)} className={`ml-auto text-xs px-3 py-1 rounded-lg ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:bg-gray-100'}`}>Lock</button>
                            )}
                        </h2>

                        {/* Warning Banner */}
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'}`}>
                            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                            <div>
                                <p className={`font-medium text-sm ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                                    ⚠️ Important: This Will Disable Google Login
                                </p>
                                <p className={`text-xs mt-1 ${isDark ? 'text-orange-400/80' : 'text-orange-600'}`}>
                                    After setting a password, you will <strong>no longer be able to sign in with Google</strong>.
                                    You must use your email and this password to log in. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={setPasswordForm.handleSubmit} className="space-y-4">
                            <div className="relative">
                                <FormInput
                                    label="New Password"
                                    name="newPassword"
                                    type={showSetNewPassword ? 'text' : 'password'}
                                    value={setPasswordForm.values.newPassword}
                                    onChange={setPasswordForm.handleChange}
                                    onBlur={setPasswordForm.handleBlur}
                                    error={setPasswordForm.touched.newPassword && setPasswordForm.errors.newPassword}
                                    icon={Lock}
                                    placeholder="Enter a strong password"
                                    required
                                    variant={isDark ? 'dark' : 'light'}
                                />
                                <button type="button" onClick={() => setShowSetNewPassword(!showSetNewPassword)} className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400'}`}>
                                    {showSetNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {setPasswordForm.values.newPassword && <PasswordStrengthIndicator password={setPasswordForm.values.newPassword} isDark={isDark} />}

                            <div className="relative">
                                <FormInput
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type={showSetConfirmPassword ? 'text' : 'password'}
                                    value={setPasswordForm.values.confirmPassword}
                                    onChange={setPasswordForm.handleChange}
                                    onBlur={setPasswordForm.handleBlur}
                                    error={setPasswordForm.touched.confirmPassword && setPasswordForm.errors.confirmPassword}
                                    icon={Lock}
                                    placeholder="Confirm your password"
                                    required
                                    variant={isDark ? 'dark' : 'light'}
                                />
                                <button type="button" onClick={() => setShowSetConfirmPassword(!showSetConfirmPassword)} className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400'}`}>
                                    {showSetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {setPasswordForm.submitError && (
                                <div className={`p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{setPasswordForm.submitError}</span>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button type="submit" className="btn-primary" disabled={setPasswordForm.isSubmitting}>
                                    {setPasswordForm.isSubmitting
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting Password...</>
                                        : <><KeyRound className="w-4 h-4 mr-2" />Set Password & Disable Google Login</>
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ==================== CHANGE PASSWORD SECTION (For Local Auth Users) ==================== */}
                {!isSsoUser && (
                    <div className={`relative p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        {passwordLocked && (
                            <LockedOverlay icon={Lock} title="Change Password" description="Update your account password" onUnlock={handleUnlockPassword} isDark={isDark} />
                        )}
                        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Lock className="w-5 h-5 text-primary-400" /> Change Password
                            {!passwordLocked && (
                                <button onClick={() => setPasswordLocked(true)} className={`ml-auto text-xs px-3 py-1 rounded-lg ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:bg-gray-100'}`}>Lock</button>
                            )}
                        </h2>

                        <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
                            <div className="relative">
                                <FormInput label="Current Password" name="currentPassword" type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.values.currentPassword} onChange={passwordForm.handleChange} onBlur={passwordForm.handleBlur} error={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword} icon={Lock} placeholder="Current password" required variant={isDark ? 'dark' : 'light'} />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400'}`}>{showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            </div>
                            <div className="relative">
                                <FormInput label="New Password" name="newPassword" type={showNewPassword ? 'text' : 'password'} value={passwordForm.values.newPassword} onChange={passwordForm.handleChange} onBlur={passwordForm.handleBlur} error={passwordForm.touched.newPassword && passwordForm.errors.newPassword} icon={Lock} placeholder="New password" required variant={isDark ? 'dark' : 'light'} />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400'}`}>{showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            </div>
                            {passwordForm.values.newPassword && <PasswordStrengthIndicator password={passwordForm.values.newPassword} isDark={isDark} />}
                            <div className="relative">
                                <FormInput label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={passwordForm.values.confirmPassword} onChange={passwordForm.handleChange} onBlur={passwordForm.handleBlur} error={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword} icon={Lock} placeholder="Confirm password" required variant={isDark ? 'dark' : 'light'} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400'}`}>{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                            </div>
                            {passwordForm.submitError && <div className={`p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}><AlertCircle className="w-4 h-4" /><span className="text-sm">{passwordForm.submitError}</span></div>}
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="btn-primary" disabled={passwordForm.isSubmitting}>
                                    {passwordForm.isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Changing...</> : <><Lock className="w-4 h-4 mr-2" />Change Password</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ==================== CHANGE EMAIL SECTION ==================== */}
                {/* For SSO users: show two options (set password OR verify with Google) */}
                {/* For local users: show normal email change flow */}
                {isSsoUser ? (
                    <div className={`relative p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        {ssoEmailLocked && (
                            <LockedOverlay icon={Mail} title="Change Email" description="Two verification methods available" onUnlock={handleUnlockSsoEmail} isDark={isDark} />
                        )}
                        <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Mail className="w-5 h-5 text-primary-400" /> Change Email
                            {!ssoEmailLocked && (
                                <button onClick={resetSsoEmailFlow} className={`ml-auto text-xs px-3 py-1 rounded-lg ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:bg-gray-100'}`}>Lock</button>
                            )}
                        </h2>

                        {/* Step 0: Choose verification method */}
                        {ssoEmailStep === 0 && (
                            <div className="space-y-4">
                                <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                    Choose how you want to verify your identity:
                                </p>

                                {/* Option 1: Set Password First */}
                                <div className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${isDark ? 'bg-dark-700/50 border-dark-600 hover:border-primary-500/50' : 'bg-gray-50 border-gray-200 hover:border-primary-400'}`}
                                    onClick={() => { resetSsoEmailFlow(); setSsoPasswordLocked(false); }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                                            <KeyRound className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Option 1: Set Password First</p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                Set a password, then change email (disables Google login)
                                            </p>
                                        </div>
                                        <ArrowRight className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                                    </div>
                                </div>

                                {/* Option 2: Verify with Google */}
                                <div className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${isDark ? 'bg-dark-700/50 border-dark-600 hover:border-primary-500/50' : 'bg-gray-50 border-gray-200 hover:border-primary-400'}`}
                                    onClick={() => setSsoEmailStep(1)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                            <ExternalLink className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Option 2: Verify with Google</p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                Verify via Google login, then change email (keeps Google login)
                                            </p>
                                        </div>
                                        <ArrowRight className={`w-4 h-4 ${isDark ? 'text-dark-400' : 'text-gray-400'}`} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Verify with Google */}
                        {ssoEmailStep === 1 && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                        Click the button below to verify your identity via Google login.
                                    </p>
                                </div>

                                <SsoVerifyButton
                                    onVerify={handleSsoGoogleVerify}
                                    isLoading={ssoEmailVerifying}
                                    isDark={isDark}
                                />

                                <button
                                    onClick={() => setSsoEmailStep(0)}
                                    className={`text-sm ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    ← Back to options
                                </button>
                            </div>
                        )}

                        {/* Step 2: Enter new email */}
                        {ssoEmailStep === 2 && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                                    <p className={`text-sm flex items-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Google account verified! Now enter your new email.
                                    </p>
                                </div>

                                <FormInput
                                    label="New Email Address"
                                    name="ssoNewEmail"
                                    type="email"
                                    value={ssoNewEmail}
                                    onChange={(e) => setSsoNewEmail(e.target.value)}
                                    icon={Mail}
                                    placeholder="Enter your new email"
                                    required
                                    variant={isDark ? 'dark' : 'light'}
                                />

                                <button
                                    onClick={handleSsoConfirmNewEmail}
                                    disabled={!ssoNewEmail.includes('@')}
                                    className="btn-primary w-full"
                                >
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        )}

                        {/* Step 3: Confirm change (No OTP needed - already verified via Google) */}
                        {ssoEmailStep === 3 && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                                    <p className={`text-sm flex items-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Identity verified via Google! Ready to change email.
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                                    <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                        <AlertTriangle className="w-4 h-4 inline mr-2" />
                                        After changing your email, you'll need to log in again. If your new email is a Google account, you can continue using Google login.
                                    </p>
                                </div>

                                <div className={`p-4 rounded-xl ${isDark ? 'bg-dark-700' : 'bg-gray-100'}`}>
                                    <p className={`text-xs ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>Changing from:</p>
                                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentUser?.email}</p>
                                    <p className={`text-xs mt-2 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>To:</p>
                                    <p className={`font-medium text-primary-400`}>{ssoNewEmail}</p>
                                </div>

                                <button
                                    onClick={handleSsoEmailChange}
                                    disabled={ssoEmailVerifying}
                                    className="btn-primary w-full"
                                >
                                    {ssoEmailVerifying
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Changing...</>
                                        : <><Mail className="w-4 h-4 mr-2" />Confirm Email Change</>
                                    }
                                </button>
                            </div>
                        )}

                        {/* Error display */}
                        {ssoEmailError && (
                            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{ssoEmailError}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`relative p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                        {emailLocked && (
                            <LockedOverlay icon={Mail} title="Change Email" description="Update email with OTP verification" onUnlock={handleUnlockEmail} isDark={isDark} />
                        )}
                        <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Mail className="w-5 h-5 text-primary-400" /> Change Email
                            {!emailLocked && (
                                <button onClick={resetEmailFlow} className={`ml-auto text-xs px-3 py-1 rounded-lg ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:bg-gray-100'}`}>Lock</button>
                            )}
                        </h2>

                        <div className="space-y-6">
                            {/* Step Indicator */}
                            <div className="flex items-center justify-center gap-2 mb-6">
                                {[1, 2, 3, 4].map((s) => (
                                    <React.Fragment key={s}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${emailStep >= s ? 'bg-primary-500 text-white' : isDark ? 'bg-dark-700 text-dark-400' : 'bg-gray-200 text-gray-400'}`}>{s}</div>
                                        {s < 4 && <div className={`w-8 h-0.5 ${emailStep > s ? 'bg-primary-500' : isDark ? 'bg-dark-700' : 'bg-gray-200'}`} />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Current Email Display */}
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>Current Email</label>
                                <div className={`px-4 py-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-600'}`}>
                                    <Mail className="w-4 h-4" /><span>{currentUser?.email || 'N/A'}</span>
                                    {currentEmailVerified && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                                </div>
                            </div>

                            {/* Step 1: Verify Current Email */}
                            {emailStep === 1 && (
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                        <KeyRound className="w-4 h-4 inline mr-2 text-primary-400" />
                                        First, verify your current email by entering the OTP we'll send you.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={handleSendCurrentEmailOtp} disabled={otpSending} className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${isDark ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}>
                                            {otpSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send OTP to Current Email
                                        </button>
                                    </div>

                                    <div className="mt-4">
                                        <OtpInputField
                                            value={currentEmailOtp}
                                            onChange={setCurrentEmailOtp}
                                            onVerify={(otp) => handleVerifyCurrentEmailOtp(otp)}
                                            isVerifying={otpVerifying}
                                            disabled={otpSending}
                                            isDark={isDark}
                                        />
                                        <button onClick={() => handleVerifyCurrentEmailOtp()} disabled={currentEmailOtp.length !== 6 || otpVerifying} className="btn-primary w-full mt-4">
                                            {otpVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <>Verify & Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                                        </button>
                                    </div>

                                    {otpError && <p className="text-red-400 text-sm mt-2 text-center">{otpError}</p>}
                                </div>
                            )}

                            {/* Step 2: Enter New Email */}
                            {emailStep === 2 && (
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className={`text-sm mb-4 flex items-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Current email verified! Now enter your new email.
                                    </p>
                                    <FormInput label="New Email Address" name="newEmail" type="email" value={emailForm.values.newEmail} onChange={emailForm.handleChange} onBlur={emailForm.handleBlur} error={emailForm.touched.newEmail && emailForm.errors.newEmail} icon={Mail} placeholder="new@email.com" required variant={isDark ? 'dark' : 'light'} />
                                    <button onClick={handleSendNewEmailOtp} disabled={!emailForm.values.newEmail || emailForm.errors.newEmail || otpSending} className="btn-primary w-full mt-4">
                                        {otpSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : <>Send OTP to New Email <ArrowRight className="w-4 h-4 ml-2" /></>}
                                    </button>
                                    {otpError && <p className="text-red-400 text-sm mt-2 text-center">{otpError}</p>}
                                </div>
                            )}

                            {/* Step 3: Verify New Email */}
                            {emailStep === 3 && (
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-dark-700/50 border-dark-600' : 'bg-gray-50 border-gray-200'}`}>
                                    <p className={`text-sm mb-4 ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                        <KeyRound className="w-4 h-4 inline mr-2 text-primary-400" />
                                        Enter the OTP sent to <strong className="text-primary-400">{emailForm.values.newEmail}</strong>
                                    </p>

                                    <OtpInputField
                                        value={newEmailOtp}
                                        onChange={setNewEmailOtp}
                                        onVerify={(otp) => handleVerifyNewEmailOtp(otp)}
                                        isVerifying={otpVerifying}
                                        disabled={otpSending}
                                        isDark={isDark}
                                    />
                                    <button onClick={() => handleVerifyNewEmailOtp()} disabled={newEmailOtp.length !== 6 || otpVerifying} className="btn-primary w-full mt-4">
                                        {otpVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <>Verify & Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                                    </button>

                                    {otpError && <p className="text-red-400 text-sm mt-2 text-center">{otpError}</p>}
                                </div>
                            )}

                            {/* Step 4: Confirm with Password */}
                            {emailStep === 4 && (
                                <form onSubmit={emailForm.handleSubmit} className="space-y-4">
                                    <div className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                                        <p className={`text-sm flex items-center ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                            <CheckCircle className="w-4 h-4 mr-2" /> Both emails verified! Enter your password to confirm.
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                                        <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}><AlertTriangle className="w-4 h-4 inline mr-2" />You'll need to log in with your new email after this change.</p>
                                    </div>
                                    <div className="relative">
                                        <FormInput label="Confirm with Password" name="password" type={showEmailPassword ? 'text' : 'password'} value={emailForm.values.password} onChange={emailForm.handleChange} onBlur={emailForm.handleBlur} error={emailForm.touched.password && emailForm.errors.password} icon={Lock} placeholder="Your password" required variant={isDark ? 'dark' : 'light'} />
                                        <button type="button" onClick={() => setShowEmailPassword(!showEmailPassword)} className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400'}`}>{showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                    </div>
                                    {emailForm.submitError && <div className={`p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'}`}><AlertCircle className="w-4 h-4" /><span className="text-sm">{emailForm.submitError}</span></div>}
                                    <button type="submit" className="btn-primary w-full" disabled={emailForm.isSubmitting}>
                                        {emailForm.isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Changing...</> : <><Mail className="w-4 h-4 mr-2" />Change Email</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Success Modal */}
            <SuccessModal isOpen={showSuccessModal} onClose={handleLogoutAndRedirect} title={successTitle} message={successMessage} isDark={isDark} countdown={countdown} />
        </div>
    );
}
