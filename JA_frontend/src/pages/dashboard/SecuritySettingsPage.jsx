/**
 * Security Settings Page
 * 
 * Allows users to change their email and password
 * Requirement 3.1.1: Job Applicants shall be able to edit their Email and Password
 * 
 * Architecture:
 * - A.3.a: Uses Headless UI hooks for form state management (useHeadlessForm, useHeadlessModal)
 * - A.2.a: Uses reusable FormInput components
 * - Full client-side validation matching project requirements
 * - SSO user detection (Google users cannot change password)
 * - Light/Dark mode support via ThemeContext
 * - Responsive layout with smooth animations
 * - Locked overlay feature for focused interaction
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Lock, Mail, Shield, Eye, EyeOff, Loader2,
    CheckCircle, AlertCircle, AlertTriangle, Info, Unlock
} from 'lucide-react';
import AuthService from '../../services/AuthService';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import useHeadlessForm from '../../components/headless/HeadlessForm';
import { FormInput } from '../../components/reusable';

/**
 * Password validation matching requirement 1.2.1
 */
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('At least 1 uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('At least 1 lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('At least 1 number');
    }
    if (!/[@#$%^&+=!]/.test(password)) {
        errors.push('At least 1 special character (@#$%^&+=!)');
    }
    return errors;
};

/**
 * Validation for password change form
 */
const validatePasswordForm = (values) => {
    const errors = {};

    if (!values.currentPassword) {
        errors.currentPassword = 'Current password is required';
    }

    if (!values.newPassword) {
        errors.newPassword = 'New password is required';
    } else {
        const passwordErrors = validatePassword(values.newPassword);
        if (passwordErrors.length > 0) {
            errors.newPassword = passwordErrors[0];
        }
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
    } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
};

/**
 * Validation for email change form matching requirement 1.2.2
 */
const validateEmailForm = (values) => {
    const errors = {};

    if (!values.newEmail) {
        errors.newEmail = 'New email is required';
    } else {
        if (!values.newEmail.includes('@')) {
            errors.newEmail = 'Email must contain @';
        } else if (!/\.[a-zA-Z]{2,}$/.test(values.newEmail)) {
            errors.newEmail = 'Email must have a valid domain';
        } else if (values.newEmail.length > 254) {
            errors.newEmail = 'Email must be less than 255 characters';
        } else if (/[\s\(\)\[\];:]/.test(values.newEmail)) {
            errors.newEmail = 'Email contains invalid characters';
        }
    }

    if (!values.password) {
        errors.password = 'Password is required for verification';
    }

    return errors;
};

/**
 * Password Strength Indicator Component
 */
const PasswordStrengthIndicator = ({ password, isDark }) => {
    const requirements = [
        { test: password.length >= 8, label: '8+ characters' },
        { test: /[A-Z]/.test(password), label: 'Uppercase' },
        { test: /[a-z]/.test(password), label: 'Lowercase' },
        { test: /[0-9]/.test(password), label: 'Number' },
        { test: /[@#$%^&+=!]/.test(password), label: 'Special (@#$%^&+=!)' },
    ];

    const passedCount = requirements.filter(r => r.test).length;
    const strengthPercent = (passedCount / requirements.length) * 100;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-dark-700' : 'bg-gray-200'}`}>
                    <div
                        className={`h-full transition-all duration-300 ${strengthPercent <= 20 ? 'bg-red-500' :
                                strengthPercent <= 40 ? 'bg-orange-500' :
                                    strengthPercent <= 60 ? 'bg-yellow-500' :
                                        strengthPercent <= 80 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${strengthPercent}%` }}
                    />
                </div>
                <span className={`text-xs font-medium ${strengthPercent <= 40 ? 'text-red-400' :
                        strengthPercent <= 60 ? 'text-yellow-400' :
                            strengthPercent <= 80 ? 'text-blue-400' : 'text-green-400'
                    }`}>
                    {strengthPercent <= 20 ? 'Very Weak' :
                        strengthPercent <= 40 ? 'Weak' :
                            strengthPercent <= 60 ? 'Fair' :
                                strengthPercent <= 80 ? 'Good' : 'Strong'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-1">
                {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                        {req.test ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : (
                            <div className={`w-3 h-3 rounded-full border ${isDark ? 'border-dark-500' : 'border-gray-300'}`} />
                        )}
                        <span className={`text-xs ${req.test
                                ? 'text-green-400'
                                : isDark ? 'text-dark-400' : 'text-gray-400'
                            }`}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Locked Overlay Component - Shows when section is locked
 * Architecture: Reusable component for locked state UI
 */
const LockedOverlay = ({ icon: Icon, title, description, onUnlock, isDark }) => (
    <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] rounded-2xl transition-all duration-300">
        <div className={`
      absolute inset-0 rounded-2xl
      ${isDark ? 'bg-dark-900/80' : 'bg-gray-100/80'}
    `} />
        <div className="relative z-20 text-center p-6">
            <div className={`
        w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
        ${isDark
                    ? 'bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30'
                    : 'bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200'
                }
        transition-transform hover:scale-105
      `}>
                <Icon className={`w-7 h-7 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
            </h3>
            <p className={`text-sm mb-4 max-w-xs mx-auto ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                {description}
            </p>
            <button
                onClick={onUnlock}
                className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium
          transition-all duration-300 transform hover:scale-105
          ${isDark
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40'
                        : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50'
                    }
        `}
            >
                <Unlock className="w-4 h-4" />
                Unlock to Edit
            </button>
        </div>
    </div>
);

/**
 * Security Settings Page
 */
export default function SecuritySettingsPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { isDark } = useTheme();

    // Lock states for each section
    const [passwordLocked, setPasswordLocked] = useState(true);
    const [emailLocked, setEmailLocked] = useState(true);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showEmailPassword, setShowEmailPassword] = useState(false);

    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [emailSuccess, setEmailSuccess] = useState(false);
    const [isSsoUser, setIsSsoUser] = useState(false);

    // Check if user is SSO user
    useEffect(() => {
        if (currentUser?.authProvider === 'google') {
            setIsSsoUser(true);
        }
    }, [currentUser]);

    // Password change form with Headless UI
    const passwordForm = useHeadlessForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validate: validatePasswordForm,
        onSubmit: async (values) => {
            try {
                const response = await AuthService.changePassword(
                    values.currentPassword,
                    values.newPassword,
                    values.confirmPassword
                );

                if (response.success) {
                    setPasswordSuccess(true);
                    setPasswordLocked(true); // Re-lock after success
                    passwordForm.resetForm();
                    setTimeout(() => setPasswordSuccess(false), 5000);
                    return { success: true };
                } else {
                    if (response.isSsoUser) {
                        setIsSsoUser(true);
                    }
                    throw new Error(response.message || 'Failed to change password');
                }
            } catch (err) {
                throw new Error(err.message || 'Failed to change password');
            }
        },
    });

    // Email change form with Headless UI
    const emailForm = useHeadlessForm({
        initialValues: {
            newEmail: '',
            password: '',
        },
        validate: validateEmailForm,
        onSubmit: async (values) => {
            try {
                const response = await AuthService.changeEmail(values.newEmail, values.password);

                if (response.success) {
                    setEmailSuccess(true);
                    setEmailLocked(true); // Re-lock after success
                    emailForm.resetForm();
                    setTimeout(() => setEmailSuccess(false), 5000);
                    return { success: true };
                } else {
                    if (response.isSsoUser) {
                        setIsSsoUser(true);
                    }
                    throw new Error(response.message || 'Failed to change email');
                }
            } catch (err) {
                throw new Error(err.message || 'Failed to change email');
            }
        },
    });

    // Handle unlock - locks the other section
    const handleUnlockPassword = () => {
        setPasswordLocked(false);
        setEmailLocked(true);
        // Reset password form when unlocking
        passwordForm.resetForm();
    };

    const handleUnlockEmail = () => {
        setEmailLocked(false);
        setPasswordLocked(true);
        // Reset email form when unlocking
        emailForm.resetForm();
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/dashboard/profile')}
                    className={`flex items-center gap-2 transition-colors mb-4 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Profile</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                        <Shield className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                        <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Security Settings
                        </h1>
                        <p className={`mt-1 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            Manage your account security and credentials
                        </p>
                    </div>
                </div>
            </div>

            {/* SSO User Notice */}
            {isSsoUser && (
                <div className={`
          mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in
          ${isDark
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'bg-blue-50 border border-blue-200'
                    }
        `}>
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            Google Account Connected
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>
                            Your account is linked to Google SSO. Password and email changes must be managed through your Google account.
                        </p>
                    </div>
                </div>
            )}

            {/* Instruction Text */}
            <div className={`
        mb-6 p-4 rounded-xl flex items-start gap-3
        ${isDark ? 'bg-dark-800/50 border border-dark-700' : 'bg-gray-50 border border-gray-200'}
      `}>
                <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-primary-400' : 'text-primary-500'}`} />
                <p className={`text-sm ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                    Click <strong>"Unlock to Edit"</strong> on the section you want to modify. Only one section can be edited at a time for your security.
                </p>
            </div>

            <div className="space-y-6">
                {/* Change Password Section */}
                <div className={`
          relative p-6 rounded-2xl border transition-all duration-300
          ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          ${isSsoUser ? 'opacity-60 pointer-events-none' : ''}
        `}>
                    {/* Locked Overlay for Password */}
                    {passwordLocked && !isSsoUser && (
                        <LockedOverlay
                            icon={Lock}
                            title="Change Password"
                            description="Update your account password to keep your account secure"
                            onUnlock={handleUnlockPassword}
                            isDark={isDark}
                        />
                    )}

                    <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Lock className="w-5 h-5 text-primary-400" />
                        Change Password
                        {!passwordLocked && !isSsoUser && (
                            <button
                                onClick={() => setPasswordLocked(true)}
                                className={`ml-auto text-xs px-3 py-1 rounded-lg transition-colors ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Lock
                            </button>
                        )}
                    </h2>

                    {/* Password Success Message */}
                    {passwordSuccess && (
                        <div className={`
              mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in
              ${isDark
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-green-50 border border-green-200 text-green-700'
                            }
            `}>
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Password changed successfully!</p>
                                <p className={`text-sm mt-1 ${isDark ? 'text-green-400/70' : 'text-green-600'}`}>
                                    Your password has been updated. Use your new password next time you log in.
                                </p>
                            </div>
                        </div>
                    )}

                    {isSsoUser ? (
                        <div className={`text-center py-8 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Password management is handled by Google.</p>
                            <a
                                href="https://myaccount.google.com/security"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
                            >
                                Manage your Google account security →
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={passwordForm.handleSubmit} className="space-y-4">
                            {/* Current Password */}
                            <div className="relative">
                                <FormInput
                                    label="Current Password"
                                    name="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordForm.values.currentPassword}
                                    onChange={passwordForm.handleChange}
                                    onBlur={passwordForm.handleBlur}
                                    error={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
                                    icon={Lock}
                                    placeholder="Enter your current password"
                                    required
                                    variant={isDark ? 'dark' : 'light'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* New Password */}
                            <div className="relative">
                                <FormInput
                                    label="New Password"
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={passwordForm.values.newPassword}
                                    onChange={passwordForm.handleChange}
                                    onBlur={passwordForm.handleBlur}
                                    error={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
                                    icon={Lock}
                                    placeholder="Enter your new password"
                                    required
                                    variant={isDark ? 'dark' : 'light'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {passwordForm.values.newPassword && (
                                <PasswordStrengthIndicator password={passwordForm.values.newPassword} isDark={isDark} />
                            )}

                            {/* Confirm Password */}
                            <div className="relative">
                                <FormInput
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordForm.values.confirmPassword}
                                    onChange={passwordForm.handleChange}
                                    onBlur={passwordForm.handleBlur}
                                    error={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
                                    icon={Lock}
                                    placeholder="Confirm your new password"
                                    required
                                    variant={isDark ? 'dark' : 'light'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Submit Error */}
                            {passwordForm.submitError && (
                                <div className={`
                  p-3 rounded-xl flex items-center gap-2 animate-shake
                  ${isDark
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                    }
                `}>
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{passwordForm.submitError}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={passwordForm.isSubmitting}
                                >
                                    {passwordForm.isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Change Password
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Change Email Section */}
                <div className={`
          relative p-6 rounded-2xl border transition-all duration-300
          ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200 shadow-sm'}
          ${isSsoUser ? 'opacity-60 pointer-events-none' : ''}
        `}>
                    {/* Locked Overlay for Email */}
                    {emailLocked && !isSsoUser && (
                        <LockedOverlay
                            icon={Mail}
                            title="Change Email"
                            description="Update your email address for account notifications and login"
                            onUnlock={handleUnlockEmail}
                            isDark={isDark}
                        />
                    )}

                    <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <Mail className="w-5 h-5 text-primary-400" />
                        Change Email
                        {!emailLocked && !isSsoUser && (
                            <button
                                onClick={() => setEmailLocked(true)}
                                className={`ml-auto text-xs px-3 py-1 rounded-lg transition-colors ${isDark ? 'text-dark-400 hover:text-white hover:bg-dark-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                Lock
                            </button>
                        )}
                    </h2>

                    {/* Email Success Message */}
                    {emailSuccess && (
                        <div className={`
              mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in
              ${isDark
                                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                : 'bg-green-50 border border-green-200 text-green-700'
                            }
            `}>
                            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">Email changed successfully!</p>
                                <p className={`text-sm mt-1 ${isDark ? 'text-green-400/70' : 'text-green-600'}`}>
                                    A confirmation has been sent to your old email address.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Warning Box */}
                    {!emailLocked && (
                        <div className={`
              mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in
              ${isDark
                                ? 'bg-yellow-500/10 border border-yellow-500/20'
                                : 'bg-yellow-50 border border-yellow-200'
                            }
            `}>
                            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            <div>
                                <p className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                    Important
                                </p>
                                <p className={`text-sm mt-1 ${isDark ? 'text-yellow-400/70' : 'text-yellow-600'}`}>
                                    Changing your email will update your login credentials. You'll need to use the new email to sign in.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Current Email Display */}
                    <div className="mb-4">
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-dark-300' : 'text-gray-700'}`}>
                            Current Email
                        </label>
                        <div className={`
              px-4 py-3 rounded-xl flex items-center gap-3
              ${isDark ? 'bg-dark-700 text-dark-300' : 'bg-gray-100 text-gray-600'}
            `}>
                            <Mail className="w-4 h-4" />
                            <span>{currentUser?.email || 'Not available'}</span>
                        </div>
                    </div>

                    {isSsoUser ? (
                        <div className={`text-center py-8 ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Email management is handled by Google.</p>
                            <a
                                href="https://myaccount.google.com/email"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
                            >
                                Manage your Google account email →
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={emailForm.handleSubmit} className="space-y-4">
                            {/* New Email */}
                            <FormInput
                                label="New Email Address"
                                name="newEmail"
                                type="email"
                                value={emailForm.values.newEmail}
                                onChange={emailForm.handleChange}
                                onBlur={emailForm.handleBlur}
                                error={emailForm.touched.newEmail && emailForm.errors.newEmail}
                                icon={Mail}
                                placeholder="Enter your new email"
                                required
                                variant={isDark ? 'dark' : 'light'}
                            />

                            {/* Password Verification */}
                            <div className="relative">
                                <FormInput
                                    label="Verify with Password"
                                    name="password"
                                    type={showEmailPassword ? 'text' : 'password'}
                                    value={emailForm.values.password}
                                    onChange={emailForm.handleChange}
                                    onBlur={emailForm.handleBlur}
                                    error={emailForm.touched.password && emailForm.errors.password}
                                    icon={Lock}
                                    placeholder="Enter your password to confirm"
                                    required
                                    variant={isDark ? 'dark' : 'light'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEmailPassword(!showEmailPassword)}
                                    className={`absolute right-3 top-9 ${isDark ? 'text-dark-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Submit Error */}
                            {emailForm.submitError && (
                                <div className={`
                  p-3 rounded-xl flex items-center gap-2 animate-shake
                  ${isDark
                                        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                    }
                `}>
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{emailForm.submitError}</span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={emailForm.isSubmitting}
                                >
                                    {emailForm.isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Change Email
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
