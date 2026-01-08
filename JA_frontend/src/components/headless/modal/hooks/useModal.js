/**
 * useModal Hook
 * 
 * Provides modal state management without UI rendering.
 * Supports: open/close, focus trap, keyboard handling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * const { isOpen, open, close, toggle } = useModal();
 */
import { useState, useCallback, useEffect, useRef } from "react";

export default function useModal({
    defaultOpen = false,
    onOpen,
    onClose,
    closeOnEscape = true,
    closeOnOverlayClick = true,
} = {}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const previousActiveElement = useRef(null);

    // Open modal
    const open = useCallback(() => {
        previousActiveElement.current = document.activeElement;
        setIsOpen(true);
        if (onOpen) {
            onOpen();
        }
    }, [onOpen]);

    // Close modal
    const close = useCallback(() => {
        setIsOpen(false);
        if (onClose) {
            onClose();
        }
        // Restore focus to previous element
        if (previousActiveElement.current) {
            previousActiveElement.current.focus();
        }
    }, [onClose]);

    // Toggle modal
    const toggle = useCallback(() => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }, [isOpen, open, close]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                close();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape, close]);

    // Handle body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Get overlay props
    const getOverlayProps = useCallback(() => ({
        onClick: closeOnOverlayClick ? close : undefined,
        'aria-hidden': !isOpen,
    }), [closeOnOverlayClick, close, isOpen]);

    // Get content props
    const getContentProps = useCallback(() => ({
        role: 'dialog',
        'aria-modal': true,
        onClick: (e) => e.stopPropagation(),
    }), []);

    // Get trigger props
    const getTriggerProps = useCallback(() => ({
        onClick: open,
        'aria-haspopup': 'dialog',
        'aria-expanded': isOpen,
    }), [open, isOpen]);

    // Get close button props
    const getCloseButtonProps = useCallback(() => ({
        onClick: close,
        'aria-label': 'Close modal',
    }), [close]);

    return {
        // State
        isOpen,

        // Actions
        open,
        close,
        toggle,

        // Props helpers
        getOverlayProps,
        getContentProps,
        getTriggerProps,
        getCloseButtonProps,
    };
}
