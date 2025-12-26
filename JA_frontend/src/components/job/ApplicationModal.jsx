/**
 * Application Modal Component
 * 
 * Modal for applying to a job with optional cover letter and file uploads.
 * Implements Requirements 4.2.3 (cover letter) and 4.3.2 (CV/cover letter upload).
 * 
 * Features:
 * - Cover letter text input
 * - CV file upload
 * - Cover letter file upload
 * - Form validation
 * 
 * Architecture: Uses HeadlessModal and HeadlessForm
 */

import React, { useState, useRef } from 'react';
import {
    X, Upload, FileText, Paperclip, Loader2, CheckCircle,
    AlertCircle, File, Trash2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useHeadlessModal, useHeadlessForm } from '../../components/headless';
import applicationService from '../../services/ApplicationService';

const ApplicationModal = ({
    isOpen,
    onClose,
    job,
    onSuccess
}) => {
    const { isDark } = useTheme();

    // State
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cvFile, setCvFile] = useState(null);
    const [coverLetterFile, setCoverLetterFile] = useState(null);

    // File input refs
    const cvInputRef = useRef(null);
    const coverLetterInputRef = useRef(null);

    // Form setup
    const form = useHeadlessForm({
        initialValues: {
            coverLetterText: '',
        },
        validate: (values) => {
            const errors = {};
            // Cover letter text is optional per requirements
            if (values.coverLetterText && values.coverLetterText.length < 50) {
                errors.coverLetterText = 'Cover letter should be at least 50 characters if provided';
            }
            if (values.coverLetterText && values.coverLetterText.length > 5000) {
                errors.coverLetterText = 'Cover letter should not exceed 5000 characters';
            }
            return errors;
        },
        onSubmit: async (values) => {
            // Validate CV is required
            if (!cvFile) {
                setError('CV file is required. Please upload your CV.');
                return;
            }

            setSubmitting(true);
            setError(null);

            try {
                await applicationService.createApplication({
                    jobPostId: job.id,
                    jobTitle: job.title,
                    companyName: job.company,
                    coverLetterText: values.coverLetterText || null,
                    cvFile: cvFile,
                    coverLetterFile: coverLetterFile,
                });

                setSuccess(true);

                // Call onSuccess callback after delay
                setTimeout(() => {
                    onSuccess?.();
                    handleClose();
                }, 1500);
            } catch (err) {
                setError(err.message || 'Failed to submit application. Please try again.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Handle close and reset
    const handleClose = () => {
        if (submitting) return;
        form.resetForm();
        setCvFile(null);
        setCoverLetterFile(null);
        setError(null);
        setSuccess(false);
        onClose();
    };

    // Handle file selection
    const handleCvSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('CV file must be less than 5MB');
                return;
            }
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('CV must be a PDF or Word document');
                return;
            }
            setCvFile(file);
            setError(null);
        }
    };

    const handleCoverLetterFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Cover letter file must be less than 5MB');
                return;
            }
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                setError('Cover letter must be a PDF or Word document');
                return;
            }
            setCoverLetterFile(file);
            setError(null);
        }
    };

    // Styles
    const overlayClass = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
    const modalClass = `w-full max-w-lg rounded-2xl border shadow-2xl ${isDark ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
        }`;
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const inputClass = `
    w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none
    ${isDark
            ? 'bg-dark-900 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500'
        }
  `;

    if (!isOpen) return null;

    // Success state
    if (success) {
        return (
            <div className={overlayClass}>
                <div className={modalClass}>
                    <div className="p-8 text-center">
                        <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>
                            Application Submitted!
                        </h3>
                        <p className={textSecondary}>
                            Your application for {job?.title} has been sent.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={overlayClass} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className={modalClass}>
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-dark-700' : 'border-gray-200'}`}>
                    <div>
                        <h2 className={`text-lg font-semibold ${textPrimary}`}>Apply for Position</h2>
                        <p className={`text-sm ${textSecondary}`}>{job?.title} at {job?.company}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-dark-700 text-dark-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={form.handleSubmit} className="p-5 space-y-5">
                    {/* Error Alert */}
                    {error && (
                        <div className={`p-3 rounded-xl border flex items-center gap-2 text-sm ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
                            }`}>
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* CV Upload */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                            <FileText className="w-4 h-4 inline mr-1" />
                            Curriculum Vitae (CV)
                        </label>

                        <input
                            type="file"
                            ref={cvInputRef}
                            onChange={handleCvSelect}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                        />

                        {cvFile ? (
                            <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-dark-900 border-dark-600' : 'bg-gray-50 border-gray-300'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <File className="w-5 h-5 text-primary-500" />
                                    <span className={`text-sm truncate max-w-[200px] ${textPrimary}`}>
                                        {cvFile.name}
                                    </span>
                                    <span className={`text-xs ${textSecondary}`}>
                                        ({(cvFile.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCvFile(null)}
                                    className={`p-1 rounded hover:bg-red-500/20 text-red-500`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => cvInputRef.current?.click()}
                                className={`w-full p-4 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center gap-2 ${isDark
                                    ? 'border-dark-600 hover:border-dark-500 text-dark-400'
                                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                                    }`}
                            >
                                <Upload className="w-6 h-6" />
                                <span className="text-sm">Click to upload CV (PDF or Word)</span>
                            </button>
                        )}
                    </div>

                    {/* Cover Letter Text */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                            <Paperclip className="w-4 h-4 inline mr-1" />
                            Cover Letter (Optional)
                        </label>
                        <textarea
                            value={form.values.coverLetterText}
                            onChange={(e) => form.setFieldValue('coverLetterText', e.target.value)}
                            placeholder="Write a brief cover letter explaining why you're a great fit for this role..."
                            rows={5}
                            className={`${inputClass} ${form.errors.coverLetterText ? 'border-red-500' : ''}`}
                        />
                        <div className="flex justify-between mt-1">
                            {form.errors.coverLetterText ? (
                                <span className="text-sm text-red-500">{form.errors.coverLetterText}</span>
                            ) : (
                                <span className={`text-xs ${textSecondary}`}>
                                    A good cover letter can increase your chances
                                </span>
                            )}
                            <span className={`text-xs ${textSecondary}`}>
                                {form.values.coverLetterText.length}/5000
                            </span>
                        </div>
                    </div>

                    {/* Cover Letter File Upload */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                            Or upload cover letter file
                        </label>

                        <input
                            type="file"
                            ref={coverLetterInputRef}
                            onChange={handleCoverLetterFileSelect}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                        />

                        {coverLetterFile ? (
                            <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-dark-900 border-dark-600' : 'bg-gray-50 border-gray-300'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <File className="w-5 h-5 text-primary-500" />
                                    <span className={`text-sm truncate max-w-[200px] ${textPrimary}`}>
                                        {coverLetterFile.name}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCoverLetterFile(null)}
                                    className={`p-1 rounded hover:bg-red-500/20 text-red-500`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => coverLetterInputRef.current?.click()}
                                className={`w-full p-3 rounded-xl border-2 border-dashed transition-colors flex items-center justify-center gap-2 ${isDark
                                    ? 'border-dark-600 hover:border-dark-500 text-dark-400'
                                    : 'border-gray-300 hover:border-gray-400 text-gray-500'
                                    }`}
                            >
                                <Upload className="w-4 h-4" />
                                <span className="text-sm">Upload file (PDF or Word)</span>
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isDark
                                ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`
                flex-1 py-3 rounded-xl font-semibold text-white transition-all
                flex items-center justify-center gap-2
                ${submitting
                                    ? 'bg-primary-600/50 cursor-not-allowed'
                                    : 'bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30'
                                }
              `}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplicationModal;
