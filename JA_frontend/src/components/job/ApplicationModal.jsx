/**
 * Application Modal Component
 * 
 * Modal for applying to a job with optional cover letter and file uploads.
 * Implements Requirements 4.2.3 (cover letter) and 4.3.2 (CV/cover letter upload).
 * 
 * Features:
 * - Cover letter text input
 * - CV file upload (required)
 * - Cover letter file upload (optional)
 * - Form validation
 * - Success/Error states with animations
 * 
 * Architecture: Uses Headless Modal compound components (Ultimo A.3.a)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Upload, FileText, Paperclip, Loader2, CheckCircle,
    AlertCircle, File, Trash2, Briefcase, Building2, MapPin
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Modal, useModal, useForm } from '../../components/headless';
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
    const [dragOver, setDragOver] = useState({ cv: false, coverLetter: false });

    // File input refs
    const cvInputRef = useRef(null);
    const coverLetterInputRef = useRef(null);

    // Modal controller - sync external isOpen with internal state
    const modalController = useModal({
        defaultOpen: isOpen,
        onClose: () => {
            if (!submitting) {
                handleClose();
            }
        },
        closeOnEscape: !submitting,
        closeOnOverlayClick: !submitting,
    });

    // Sync external isOpen prop with modal controller
    useEffect(() => {
        if (isOpen && !modalController.isOpen) {
            modalController.open();
        } else if (!isOpen && modalController.isOpen) {
            modalController.close();
        }
    }, [isOpen]);

    // Form setup using headless form hook
    const form = useForm({
        initialValues: {
            coverLetterText: '',
        },
        validate: (values) => {
            const errors = {};
            // Cover letter text is optional per requirements 4.2.3
            if (values.coverLetterText && values.coverLetterText.length < 50) {
                errors.coverLetterText = 'Cover letter should be at least 50 characters if provided';
            }
            if (values.coverLetterText && values.coverLetterText.length > 5000) {
                errors.coverLetterText = 'Cover letter should not exceed 5000 characters';
            }
            return errors;
        },
        onSubmit: async (values) => {
            // Validate CV is required per requirements 4.3.2
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
                    location: job.location,
                    employmentType: job.employmentType || job.type,
                    coverLetterText: values.coverLetterText || null,
                    cvFile: cvFile,
                    coverLetterFile: coverLetterFile,
                });

                setSuccess(true);

                // Call onSuccess callback after delay
                setTimeout(() => {
                    onSuccess?.();
                    handleClose();
                }, 2000);
            } catch (err) {
                setError(err.message || 'Failed to submit application. Please try again.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    // Handle close and reset
    const handleClose = useCallback(() => {
        if (submitting) return;
        form.resetForm();
        setCvFile(null);
        setCoverLetterFile(null);
        setError(null);
        setSuccess(false);
        setDragOver({ cv: false, coverLetter: false });
        onClose();
    }, [submitting, form, onClose]);

    // Validate file type and size
    const validateFile = useCallback((file, type) => {
        // Max size 10MB per file (as per requirements)
        if (file.size > 10 * 1024 * 1024) {
            return `${type} file must be less than 10MB`;
        }
        // Validate file type (PDF, DOC, DOCX)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const allowedExtensions = ['pdf', 'doc', 'docx'];
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
            return `${type} must be a PDF or Word document`;
        }
        return null;
    }, []);

    // Handle file selection
    const handleCvSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            const validationError = validateFile(file, 'CV');
            if (validationError) {
                setError(validationError);
                return;
            }
            setCvFile(file);
            setError(null);
        }
    }, [validateFile]);

    const handleCoverLetterFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            const validationError = validateFile(file, 'Cover letter');
            if (validationError) {
                setError(validationError);
                return;
            }
            setCoverLetterFile(file);
            setError(null);
        }
    }, [validateFile]);

    // Drag and drop handlers
    const handleDragOver = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(prev => ({ ...prev, [type]: true }));
    }, []);

    const handleDragLeave = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(prev => ({ ...prev, [type]: false }));
    }, []);

    const handleDrop = useCallback((e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(prev => ({ ...prev, [type]: false }));

        const file = e.dataTransfer.files?.[0];
        if (file) {
            const validationError = validateFile(file, type === 'cv' ? 'CV' : 'Cover letter');
            if (validationError) {
                setError(validationError);
                return;
            }
            if (type === 'cv') {
                setCvFile(file);
            } else {
                setCoverLetterFile(file);
            }
            setError(null);
        }
    }, [validateFile]);

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Styles
    const cardStyle = isDark
        ? 'bg-dark-800 border-dark-700'
        : 'bg-white border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-dark-400' : 'text-gray-500';
    const inputStyle = `
        w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none
        ${isDark
            ? 'bg-dark-900 border-dark-600 text-white placeholder-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
        }
    `;

    if (!isOpen) return null;

    return (
        <Modal
            controller={modalController}
            closeOnEscape={!submitting}
            closeOnOverlayClick={!submitting}
        >
            <Modal.Overlay
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            >
                <Modal.Content
                    className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transform transition-all duration-300 animate-scaleIn ${cardStyle}`}
                >
                    {/* Success State */}
                    {success ? (
                        <div className="p-10 text-center">
                            <div className="inline-flex p-5 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-6 animate-bounce-subtle">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h3 className={`text-2xl font-bold mb-3 ${textPrimary}`}>
                                Application Submitted! 🎉
                            </h3>
                            <p className={`text-lg ${textSecondary}`}>
                                Your application for <span className="font-semibold">{job?.title}</span> has been sent.
                            </p>
                            <p className={`mt-2 text-sm ${textSecondary}`}>
                                We'll notify you when the company reviews your application.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header with Job Info */}
                            <Modal.Header className={`relative p-6 border-b ${isDark ? 'border-dark-700 bg-gradient-to-r from-dark-800 via-dark-800 to-primary-900/20' : 'border-gray-200 bg-gradient-to-r from-white via-white to-primary-50'}`}>
                                <div className="flex items-start gap-4">
                                    {/* Company Logo */}
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${isDark ? 'bg-gradient-to-br from-primary-500 to-violet-500 text-white' : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'}`}>
                                        {job?.company?.charAt(0) || 'C'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className={`text-xl font-bold mb-1 ${textPrimary}`}>
                                            Apply for Position
                                        </h2>
                                        <p className={`text-base font-medium ${isDark ? 'text-primary-400' : 'text-primary-600'}`}>
                                            {job?.title}
                                        </p>
                                        <div className={`flex flex-wrap items-center gap-3 mt-2 text-sm ${textSecondary}`}>
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                {job?.company}
                                            </span>
                                            {job?.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job?.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Modal.CloseButton
                                    disabled={submitting}
                                    className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${isDark ? 'hover:bg-dark-700 text-dark-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'} ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </Modal.Header>

                            {/* Form Body */}
                            <Modal.Body className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                <form onSubmit={form.handleSubmit} id="application-form">
                                    {/* Error Alert */}
                                    {error && (
                                        <div className={`p-4 rounded-xl border flex items-start gap-3 mb-6 animate-shake ${isDark ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Error</p>
                                                <p className="text-sm mt-0.5 opacity-90">{error}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* CV Upload - Required per 4.3.2 */}
                                    <div>
                                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${textPrimary}`}>
                                            <FileText className="w-4 h-4 text-primary-500" />
                                            Curriculum Vitae (CV)
                                            <span className="text-red-500">*</span>
                                        </label>

                                        <input
                                            type="file"
                                            ref={cvInputRef}
                                            onChange={handleCvSelect}
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                        />

                                        {cvFile ? (
                                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? 'bg-dark-900 border-green-500/30' : 'bg-green-50 border-green-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                                                        <File className="w-6 h-6 text-green-500" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium truncate max-w-[200px] ${textPrimary}`}>
                                                            {cvFile.name}
                                                        </p>
                                                        <p className={`text-xs ${textSecondary}`}>
                                                            {formatFileSize(cvFile.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setCvFile(null)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => cvInputRef.current?.click()}
                                                onDragOver={(e) => handleDragOver(e, 'cv')}
                                                onDragLeave={(e) => handleDragLeave(e, 'cv')}
                                                onDrop={(e) => handleDrop(e, 'cv')}
                                                className={`w-full p-6 rounded-xl border-2 border-dashed transition-all flex flex-col items-center gap-3 group ${dragOver.cv
                                                    ? 'border-primary-500 bg-primary-500/10'
                                                    : isDark
                                                        ? 'border-dark-600 hover:border-primary-500 hover:bg-dark-700/50'
                                                        : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-full transition-colors ${isDark ? 'bg-dark-700 group-hover:bg-primary-500/20' : 'bg-gray-100 group-hover:bg-primary-50'}`}>
                                                    <Upload className={`w-6 h-6 transition-colors ${isDark ? 'text-dark-400 group-hover:text-primary-400' : 'text-gray-500 group-hover:text-primary-500'}`} />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-sm font-medium ${isDark ? 'text-dark-300' : 'text-gray-600'}`}>
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className={`text-xs mt-1 ${textSecondary}`}>
                                                        PDF, DOC, DOCX (Max 10MB)
                                                    </p>
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Cover Letter Text - Optional per 4.2.3 */}
                                    <div>
                                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${textPrimary}`}>
                                            <Paperclip className="w-4 h-4 text-primary-500" />
                                            Cover Letter
                                            <span className={`text-xs font-normal ${textSecondary}`}>(Optional)</span>
                                        </label>
                                        <textarea
                                            value={form.values.coverLetterText}
                                            onChange={(e) => form.setFieldValue('coverLetterText', e.target.value)}
                                            placeholder="Write a brief cover letter explaining why you're a great fit for this role..."
                                            rows={5}
                                            className={`${inputStyle} ${form.errors.coverLetterText ? 'border-red-500 focus:border-red-500' : ''}`}
                                        />
                                        <div className="flex justify-between mt-2">
                                            {form.errors.coverLetterText ? (
                                                <span className="text-sm text-red-500">{form.errors.coverLetterText}</span>
                                            ) : (
                                                <span className={`text-xs ${textSecondary}`}>
                                                    A good cover letter can increase your chances
                                                </span>
                                            )}
                                            <span className={`text-xs ${form.values.coverLetterText.length > 4500 ? 'text-amber-500' : textSecondary}`}>
                                                {form.values.coverLetterText.length}/5000
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cover Letter File Upload - Optional per 4.3.2 */}
                                    <div>
                                        <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${textPrimary}`}>
                                            <File className="w-4 h-4 text-primary-500" />
                                            Upload Cover Letter File
                                            <span className={`text-xs font-normal ${textSecondary}`}>(Optional)</span>
                                        </label>

                                        <input
                                            type="file"
                                            ref={coverLetterInputRef}
                                            onChange={handleCoverLetterFileSelect}
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                        />

                                        {coverLetterFile ? (
                                            <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isDark ? 'bg-dark-900 border-primary-500/30' : 'bg-primary-50 border-primary-200'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-primary-500/20' : 'bg-primary-100'}`}>
                                                        <File className="w-6 h-6 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-medium truncate max-w-[200px] ${textPrimary}`}>
                                                            {coverLetterFile.name}
                                                        </p>
                                                        <p className={`text-xs ${textSecondary}`}>
                                                            {formatFileSize(coverLetterFile.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverLetterFile(null)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => coverLetterInputRef.current?.click()}
                                                onDragOver={(e) => handleDragOver(e, 'coverLetter')}
                                                onDragLeave={(e) => handleDragLeave(e, 'coverLetter')}
                                                onDrop={(e) => handleDrop(e, 'coverLetter')}
                                                className={`w-full p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-3 group ${dragOver.coverLetter
                                                    ? 'border-primary-500 bg-primary-500/10'
                                                    : isDark
                                                        ? 'border-dark-600 hover:border-primary-500 hover:bg-dark-700/50'
                                                        : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Upload className={`w-5 h-5 transition-colors ${isDark ? 'text-dark-400 group-hover:text-primary-400' : 'text-gray-500 group-hover:text-primary-500'}`} />
                                                <span className={`text-sm ${isDark ? 'text-dark-400' : 'text-gray-500'}`}>
                                                    Upload cover letter file (PDF or Word)
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </Modal.Body>

                            {/* Footer */}
                            <Modal.Footer className={`flex gap-3 p-6 border-t ${isDark ? 'border-dark-700 bg-dark-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={submitting}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${submitting
                                        ? 'opacity-50 cursor-not-allowed'
                                        : isDark
                                            ? 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="application-form"
                                    disabled={submitting}
                                    className={`
                                        flex-1 py-3 rounded-xl font-semibold text-white transition-all
                                        flex items-center justify-center gap-2
                                        ${submitting
                                            ? 'bg-primary-600/50 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40'
                                        }
                                    `}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Briefcase className="w-5 h-5" />
                                            Submit Application
                                        </>
                                    )}
                                </button>
                            </Modal.Footer>
                        </>
                    )}
                </Modal.Content>
            </Modal.Overlay>
        </Modal>
    );
};

export default ApplicationModal;
