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

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Lock, Mail, Shield, Eye, EyeOff, Loader2,
    CheckCircle, AlertCircle, AlertTriangle, Info, Unlock,
    Send, KeyRound, ArrowRight, PartyPopper
} from 'lucide-react';
import AuthService from '../../services/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import useHeadlessForm from '../../components/headless/HeadlessForm';
import useHeadlessModal from '../../components/headless/HeadlessModal';
import { FormInput } from '../../components/reusable';

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

const OtpInput = ({ value, onChange, disabled, isDark }) => {
    const handleChange = (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
        onChange(val);
    };
    return (
        <div className="flex justify-center gap-2">
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className={`w-12 h-14 flex items-center justify-center rounded-xl text-2xl font-bold border-2 transition-all ${value[i] ? (isDark ? 'border-primary-500 bg-primary-500/10 text-primary-400' : 'border-primary-500 bg-primary-50 text-primary-600')
                        : (isDark ? 'border-dark-600 bg-dark-800 text-dark-300' : 'border-gray-300 bg-white text-gray-400')
                        }`}
                >
                    {value[i] || '•'}
                </div>
            ))}
            <input
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleChange}
                disabled={disabled}
                className="absolute opacity-0 w-0 h-0"
                autoFocus
            />
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

// ==================== MAIN COMPONENT ====================

export default function SecuritySettingsPage() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const { isDark } = useTheme();

    // Section lock states
    const [passwordLocked, setPasswordLocked] = useState(true);
    const [emailLocked, setEmailLocked] = useState(true);

    // Password form states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Email change OTP flow states
    const [emailStep, setEmailStep] = useState(1); // 1: verify current, 2: enter new, 3: verify new, 4: submit
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

    // Check if SSO user
    useEffect(() => {
        if (currentUser?.authProvider === 'google') setIsSsoUser(true);
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

    const handleVerifyCurrentEmailOtp = async () => {
        if (currentEmailOtp.length !== 6) return;
        setOtpVerifying(true);
        setOtpError('');
        try {
            const response = await AuthService.verifyOtp(currentUser.email, currentEmailOtp);
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

    const handleVerifyNewEmailOtp = async () => {
        if (newEmailOtp.length !== 6) return;
        setOtpVerifying(true);
        setOtpError('');
        try {
            const response = await AuthService.verifyOtp(emailForm.values.newEmail, newEmailOtp);
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

    const handleUnlockPassword = () => { setPasswordLocked(false); setEmailLocked(true); passwordForm.resetForm(); };
    const handleUnlockEmail = () => {
        // Reset email flow state without re-locking
        setEmailStep(1);
        setCurrentEmailOtp('');
        setNewEmailOtp('');
        setCurrentEmailVerified(false);
        setNewEmailVerified(false);
        setOtpError('');
        emailForm.resetForm();
        // Set lock states
        setEmailLocked(false);
        setPasswordLocked(true);
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

            {/* SSO Notice */}
            {isSsoUser && (
                <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Google Account Connected</p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>Manage credentials via Google account.</p>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-dark-800/50 border border-dark-700' : 'bg-gray-50 border border-gray-200'}`}>
                <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                    Click <strong>"Unlock to Edit"</strong> to modify a section. Only one section can be edited at a time.
                </p>
            </div>

            <div className="space-y-6">
                {/* ==================== CHANGE PASSWORD SECTION ==================== */}
                <div className={`relative p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'} ${isSsoUser ? 'opacity-60 pointer-events-none' : ''}`}>
                    {passwordLocked && !isSsoUser && (
                        <LockedOverlay icon={Lock} title="Change Password" description="Update your account password" onUnlock={handleUnlockPassword} isDark={isDark} />
                    )}
                    <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Lock className="w-5 h-5 text-primary-400" /> Change Password
                        {!passwordLocked && !isSsoUser && (
                            <button onClick={() => setPasswordLocked(true)} className={`ml-auto text-xs px-3 py-1 rounded-lg ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:bg-gray-100'}`}>Lock</button>
                        )}
                    </h2>

                    {!isSsoUser && (
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
                    )}
                </div>

                {/* ==================== CHANGE EMAIL SECTION ==================== */}
                <div className={`relative p-6 rounded-2xl border transition-all ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'} ${isSsoUser ? 'opacity-60 pointer-events-none' : ''}`}>
                    {emailLocked && !isSsoUser && (
                        <LockedOverlay icon={Mail} title="Change Email" description="Update email with OTP verification" onUnlock={handleUnlockEmail} isDark={isDark} />
                    )}
                    <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Mail className="w-5 h-5 text-primary-400" /> Change Email
                        {!emailLocked && !isSsoUser && (
                            <button onClick={resetEmailFlow} className={`ml-auto text-xs px-3 py-1 rounded-lg ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:bg-gray-100'}`}>Lock</button>
                        )}
                    </h2>

                    {!isSsoUser && (
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
                                    {currentEmailOtp.length > 0 || !otpSending && otpError === '' ? (
                                        <div className="mt-4">
                                            <label className={`block text-sm font-medium mb-2 text-center ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>Enter 6-digit code</label>
                                            <input type="text" inputMode="numeric" maxLength={6} value={currentEmailOtp} onChange={(e) => setCurrentEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl border-2 ${isDark ? 'bg-dark-800 border-dark-600 text-white focus:border-primary-500' : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'} outline-none`} placeholder="000000" />
                                            <button onClick={handleVerifyCurrentEmailOtp} disabled={currentEmailOtp.length !== 6 || otpVerifying} className="btn-primary w-full mt-4">
                                                {otpVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : <>Verify & Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                                            </button>
                                        </div>
                                    ) : null}
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
                                    <input type="text" inputMode="numeric" maxLength={6} value={newEmailOtp} onChange={(e) => setNewEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className={`w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-xl border-2 ${isDark ? 'bg-dark-800 border-dark-600 text-white focus:border-primary-500' : 'bg-white border-gray-300 text-gray-900 focus:border-primary-500'} outline-none`} placeholder="000000" />
                                    <button onClick={handleVerifyNewEmailOtp} disabled={newEmailOtp.length !== 6 || otpVerifying} className="btn-primary w-full mt-4">
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
                    )}
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal isOpen={showSuccessModal} onClose={handleLogoutAndRedirect} title={successTitle} message={successMessage} isDark={isDark} countdown={countdown} />
        </div>
    );
}
