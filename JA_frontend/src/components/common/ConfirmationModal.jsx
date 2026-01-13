/**
 * Confirmation Modal Component
 * 
 * A beautiful, reusable confirmation modal that replaces browser's window.confirm()
 * Uses headless Modal component for state management without UI coupling.
 * 
 * Features:
 * - Beautiful glassmorphism design with smooth animations
 * - Support for different types: danger (deactivate/delete), warning, info
 * - Customizable title, message, and button labels
 * - Async confirmation support with loading state
 * - Keyboard accessible (Escape to cancel)
 * - Theme-aware (light/dark mode)
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * const confirmModal = useConfirmationModal();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirmModal.confirm({
 *     type: 'danger',
 *     title: 'Delete Item',
 *     message: 'Are you sure you want to delete this item?',
 *     confirmLabel: 'Delete',
 *   });
 *   if (confirmed) {
 *     // Perform delete action
 *   }
 * };
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { AlertTriangle, Trash2, XCircle, Info, AlertCircle, X, Loader2 } from 'lucide-react';
import { Modal, useModal } from '../headless';
import { useTheme } from '../../context/ThemeContext';

// Configuration for different confirmation types
const CONFIRMATION_TYPES = {
    danger: {
        icon: Trash2,
        iconColor: 'text-red-400',
        iconBg: 'bg-red-500/20',
        iconBorder: 'border-red-500/30',
        confirmBg: 'bg-red-600 hover:bg-red-700',
        confirmText: 'text-white',
        gradientFrom: 'from-red-950/90',
        gradientTo: 'to-gray-900/95',
        borderColor: 'border-red-500/30',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/20',
        iconBorder: 'border-amber-500/30',
        confirmBg: 'bg-amber-600 hover:bg-amber-700',
        confirmText: 'text-white',
        gradientFrom: 'from-amber-950/90',
        gradientTo: 'to-gray-900/95',
        borderColor: 'border-amber-500/30',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
        iconBorder: 'border-blue-500/30',
        confirmBg: 'bg-blue-600 hover:bg-blue-700',
        confirmText: 'text-white',
        gradientFrom: 'from-blue-950/90',
        gradientTo: 'to-gray-900/95',
        borderColor: 'border-blue-500/30',
    },
    deactivate: {
        icon: XCircle,
        iconColor: 'text-orange-400',
        iconBg: 'bg-orange-500/20',
        iconBorder: 'border-orange-500/30',
        confirmBg: 'bg-orange-600 hover:bg-orange-700',
        confirmText: 'text-white',
        gradientFrom: 'from-orange-950/90',
        gradientTo: 'to-gray-900/95',
        borderColor: 'border-orange-500/30',
    },
};

/**
 * ConfirmationModal Component
 */
export default function ConfirmationModal({
    isOpen = false,
    onConfirm,
    onCancel,
    type = 'danger',
    title = 'Confirm Action',
    message = 'Are you sure you want to perform this action?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isLoading = false,
    itemName = '',
}) {
    const { isDark } = useTheme();
    const config = CONFIRMATION_TYPES[type] || CONFIRMATION_TYPES.danger;
    const IconComponent = config.icon;
    const modalController = useModal();

    // Sync modal state with isOpen prop
    React.useEffect(() => {
        if (isOpen) {
            modalController.open();
        } else {
            modalController.close();
        }
    }, [isOpen]);

    // Handle confirm with loading
    const handleConfirm = async () => {
        if (onConfirm) {
            await onConfirm();
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (!isLoading && onCancel) {
            onCancel();
        }
    };

    return (
        <Modal controller={modalController} closeOnOverlayClick={!isLoading}>
            <Modal.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Modal.Content className={`
                    w-full max-w-md rounded-2xl shadow-2xl overflow-hidden
                    transform transition-all duration-300 ease-out
                    animate-scale-in
                    bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo}
                    border ${config.borderColor}
                `}>
                    {/* Header */}
                    <Modal.Header className="relative p-6 pb-4">
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`
                                p-3 rounded-xl shrink-0
                                ${config.iconBg} border ${config.iconBorder}
                            `}>
                                <IconComponent className={`w-7 h-7 ${config.iconColor}`} />
                            </div>

                            {/* Title and close button */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-white pr-8">
                                    {title}
                                </h2>
                                {itemName && (
                                    <p className={`text-sm mt-1 ${config.iconColor} font-medium`}>
                                        {itemName}
                                    </p>
                                )}
                            </div>

                            {/* Close button */}
                            {!isLoading && (
                                <button
                                    onClick={handleCancel}
                                    className="absolute top-4 right-4 p-2 rounded-lg 
                                        text-gray-400 hover:text-white hover:bg-white/10
                                        transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </Modal.Header>

                    {/* Body */}
                    <Modal.Body className="px-6 pb-4">
                        <p className="text-gray-300 leading-relaxed">
                            {message}
                        </p>
                    </Modal.Body>

                    {/* Footer */}
                    <Modal.Footer className="p-6 pt-4 flex flex-col-reverse sm:flex-row gap-3">
                        {/* Cancel button */}
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className={`
                                flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200
                                ${isLoading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-white/10 active:scale-[0.98]'
                                }
                                bg-gray-700/50 text-gray-200 border border-gray-600/50
                            `}
                        >
                            {cancelLabel}
                        </button>

                        {/* Confirm button */}
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`
                                flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200
                                flex items-center justify-center gap-2
                                ${isLoading
                                    ? 'opacity-80 cursor-wait'
                                    : 'active:scale-[0.98]'
                                }
                                ${config.confirmBg} ${config.confirmText}
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                confirmLabel
                            )}
                        </button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Overlay>
        </Modal>
    );
}

/**
 * Context for confirmation modal
 */
const ConfirmationModalContext = createContext(null);

/**
 * Custom hook to use confirmation modal
 * Provides a promise-based confirm() method for async/await usage
 */
export function useConfirmationModal() {
    const [state, setState] = useState({
        isOpen: false,
        type: 'danger',
        title: 'Confirm Action',
        message: 'Are you sure?',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        itemName: '',
        isLoading: false,
        resolve: null,
    });

    const confirm = useCallback(({
        type = 'danger',
        title = 'Confirm Action',
        message = 'Are you sure you want to perform this action?',
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        itemName = '',
    }) => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                type,
                title,
                message,
                confirmLabel,
                cancelLabel,
                itemName,
                isLoading: false,
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        // Small delay to show loading state
        await new Promise(r => setTimeout(r, 300));
        setState(prev => {
            if (prev.resolve) prev.resolve(true);
            return { ...prev, isOpen: false, isLoading: false, resolve: null };
        });
    }, []);

    const handleCancel = useCallback(() => {
        setState(prev => {
            if (prev.resolve) prev.resolve(false);
            return { ...prev, isOpen: false, isLoading: false, resolve: null };
        });
    }, []);

    // Component to render
    const ConfirmModal = useCallback(() => (
        <ConfirmationModal
            isOpen={state.isOpen}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            type={state.type}
            title={state.title}
            message={state.message}
            confirmLabel={state.confirmLabel}
            cancelLabel={state.cancelLabel}
            itemName={state.itemName}
            isLoading={state.isLoading}
        />
    ), [state, handleConfirm, handleCancel]);

    return {
        confirm,
        ConfirmModal,
        isOpen: state.isOpen,
    };
}

/**
 * Provider for confirmation modal context
 * Allows using confirmation modal from anywhere in the app
 */
export function ConfirmationModalProvider({ children }) {
    const confirmationModal = useConfirmationModal();

    return (
        <ConfirmationModalContext.Provider value={confirmationModal}>
            {children}
            <confirmationModal.ConfirmModal />
        </ConfirmationModalContext.Provider>
    );
}

/**
 * Hook to access confirmation modal from context
 */
export function useConfirmation() {
    const context = useContext(ConfirmationModalContext);
    if (!context) {
        throw new Error('useConfirmation must be used within ConfirmationModalProvider');
    }
    return context;
}
