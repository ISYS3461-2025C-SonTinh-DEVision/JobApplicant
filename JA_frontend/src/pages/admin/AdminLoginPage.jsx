/**
 * Admin Login Page
 * Separate secure login interface for administrators
 * 
 * Requirement 6.1.1: Separate secure login interface for administrators
 * 
 * Test Credentials:
 * Email: admin@devision.com
 * Password: Admin@123
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { FormInput } from '../../components/reusable/FormInput';
import { validateEmail } from '../../utils/validators/authValidators';
import { useAdminAuth } from '../../context/AdminAuthContext';

// Animated background shapes
function BackgroundShapes() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Gradient mesh - admin specific colors */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(at 30% 20%, rgba(139, 92, 246, 0.3) 0px, transparent 50%),
            radial-gradient(at 80% 10%, rgba(236, 72, 153, 0.2) 0px, transparent 50%),
            radial-gradient(at 10% 60%, rgba(139, 92, 246, 0.2) 0px, transparent 50%),
            radial-gradient(at 90% 70%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
            #0F172A
          `,
                }}
            />

            {/* Floating shapes */}
            <div className="bg-shape w-96 h-96 bg-violet-600/20 -top-20 -right-20" style={{ animationDelay: '0s' }} />
            <div className="bg-shape w-80 h-80 bg-pink-500/15 bottom-1/4 -left-20" style={{ animationDelay: '2s' }} />
            <div className="bg-shape w-72 h-72 bg-violet-500/10 top-1/3 right-1/4" style={{ animationDelay: '4s' }} />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />
        </div>
    );
}

// Admin Logo component
function AdminLogo() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center shadow-glow">
                <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
                <span className="text-xl font-bold text-white">DEVision</span>
                <span className="block text-xs text-violet-400 font-medium">Admin Portal</span>
            </div>
        </div>
    );
}

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminLogin, isAuthenticated, isLoading } = useAdminAuth();

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // UI state
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/admin/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    // Handle input change
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setSubmitError('');
    }, [errors]);

    // Handle blur for validation
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        let fieldErrors = [];

        switch (name) {
            case 'email':
                fieldErrors = validateEmail(formData.email);
                break;
            case 'password':
                if (!formData.password) {
                    fieldErrors = [{ field: 'password', message: 'Password is required' }];
                }
                break;
            default:
                break;
        }

        if (fieldErrors.length > 0) {
            setErrors((prev) => ({ ...prev, [name]: fieldErrors[0].message }));
        }
    }, [formData]);

    // Validate all fields
    const validateForm = useCallback(() => {
        const emailErrors = validateEmail(formData.email);
        const errorMap = {};

        emailErrors.forEach(({ field, message }) => {
            errorMap[field] = message;
        });

        if (!formData.password) {
            errorMap.password = 'Password is required';
        }

        setErrors(errorMap);
        return Object.keys(errorMap).length === 0;
    }, [formData]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({ email: true, password: true });

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const result = await adminLogin({
                email: formData.email,
                password: formData.password,
            });

            if (result.success) {
                const from = location.state?.from?.pathname || '/admin/dashboard';
                navigate(from, { replace: true });
            } else {
                setSubmitError(result.message || 'Invalid admin credentials');
            }
        } catch (err) {
            setSubmitError(err.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Go back to regular login
    const handleBackToLogin = () => {
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <BackgroundShapes />

            <div className="w-full max-w-md relative z-10">
                {/* Back button */}
                <button
                    onClick={handleBackToLogin}
                    className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm">Back to User Login</span>
                </button>

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <AdminLogo />
                </div>

                {/* Form Card */}
                <div className="glass-card p-8 animate-fade-in border-violet-500/20">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
                        <p className="text-dark-400">
                            Enter your administrator credentials
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        {/* Submit Error */}
                        {submitError && (
                            <div className="p-4 rounded-xl flex items-start gap-3 animate-shake bg-red-500/10 border border-red-500/20 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">{submitError}</p>
                            </div>
                        )}

                        {/* Email */}
                        <FormInput
                            label="Admin Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && errors.email}
                            icon={Mail}
                            placeholder="admin@devision.com"
                            required
                            autoComplete="email"
                            variant="dark"
                        />

                        {/* Password */}
                        <FormInput
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password && errors.password}
                            icon={Lock}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            variant="dark"
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 text-base inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200
                bg-gradient-to-r from-violet-600 to-pink-600 text-white
                hover:from-violet-500 hover:to-pink-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 focus-visible:ring-violet-500
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="w-5 h-5 mr-2" />
                                    Sign In as Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-dark-500 text-center">
                            This is a secure admin portal. All access attempts are logged.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-dark-500">
                    © {new Date().getFullYear()} DEVision. Admin Portal.
                </p>
            </div>
        </div>
    );
}
