/**
 * Account Deactivated Modal
 * 
 * Shows when user's account has been deactivated by admin.
 * Forces logout after acknowledgment with countdown.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, LogOut, HelpCircle, X } from 'lucide-react';
import { Modal, useModal } from '../headless';

/**
 * AccountDeactivatedModal Component
 * Displays when admin deactivates user's account in real-time
 */
export default function AccountDeactivatedModal({
    isOpen = false,
    reason = '',
    onLogout,
    countdownSeconds = 10,
}) {
    const [countdown, setCountdown] = useState(countdownSeconds);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Don't allow closing by clicking overlay or pressing escape - this is a critical alert
    const modalController = useModal({
        closeOnOverlayClick: false,
        closeOnEscape: false,
    });

    // Open modal when isOpen changes
    useEffect(() => {
        if (isOpen) {
            modalController.open();
            setCountdown(countdownSeconds);
            setIsLoggingOut(false);
        }
    }, [isOpen, countdownSeconds]);

    // Countdown timer
    useEffect(() => {
        if (!isOpen || isLoggingOut) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onLogout?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, isLoggingOut, onLogout]);

    // Handle immediate logout - don't wait for countdown
    const handleLogoutNow = () => {
        setIsLoggingOut(true);
        onLogout?.();
    };

    const handleContactSupport = () => {
        window.open('mailto:support@devision.com?subject=Account%20Deactivation%20Inquiry', '_blank');
    };

    return (
        <Modal controller={modalController}>
            <Modal.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Modal.Content className="w-full max-w-md bg-gradient-to-br from-red-950/90 to-gray-900/95 rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <Modal.Header className="relative p-6 pb-4 border-b border-red-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 rounded-xl">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-red-300">
                                    Account Deactivated
                                </h2>
                                <p className="text-red-400/80 text-sm">
                                    Action required
                                </p>
                            </div>
                        </div>
                    </Modal.Header>

                    {/* Body */}
                    <Modal.Body className="p-6 space-y-4">
                        <p className="text-gray-200 leading-relaxed">
                            Your account has been deactivated by an administrator.
                            You will be logged out automatically.
                        </p>

                        {reason && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-sm text-red-300">
                                    <strong>Reason:</strong> {reason}
                                </p>
                            </div>
                        )}

                        <div className="p-4 bg-gray-800/50 rounded-xl text-center">
                            <p className="text-gray-400 text-sm">
                                Auto-logout in
                            </p>
                            <p className="text-3xl font-bold text-white mt-1">
                                {countdown} seconds
                            </p>
                        </div>

                        <p className="text-gray-400 text-sm">
                            If you believe this is an error, please contact support.
                        </p>
                    </Modal.Body>

                    {/* Footer */}
                    <Modal.Footer className="p-6 pt-4 border-t border-red-500/20 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleContactSupport}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-gray-200 rounded-xl transition-colors"
                        >
                            <HelpCircle className="w-4 h-4" />
                            Contact Support
                        </button>
                        <button
                            onClick={handleLogoutNow}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout Now
                        </button>
                    </Modal.Footer>
                </Modal.Content>
            </Modal.Overlay>
        </Modal>
    );
}
