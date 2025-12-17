/**
 * HeadlessModal Hook
 * 
 * Manages modal state without UI rendering.
 * Supports: open/close, data passing, callbacks, accessibility.
 * 
 * Usage:
 * const { isOpen, open, close, data, getModalProps, getBackdropProps } = useHeadlessModal();
 * open({ title: 'Confirm', message: 'Are you sure?' });
 */

import { useState, useCallback, useEffect, useRef } from "react";

export default function useHeadlessModal({
  defaultOpen = false,
  onOpen = null,
  onClose = null,
  closeOnBackdrop = true,
  closeOnEscape = true,
} = {}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState(null);
  const previousActiveElement = useRef(null);

  // Open modal with optional data
  const open = useCallback((modalData = null) => {
    previousActiveElement.current = document.activeElement;
    setData(modalData);
    setIsOpen(true);
    if (onOpen) {
      onOpen(modalData);
    }
  }, [onOpen]);

  // Close modal
  const close = useCallback((result = null) => {
    setIsOpen(false);
    if (onClose) {
      onClose(result);
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Get backdrop props
  const getBackdropProps = useCallback(() => ({
    onClick: closeOnBackdrop ? close : undefined,
    'aria-hidden': true,
  }), [closeOnBackdrop, close]);

  // Get modal props
  const getModalProps = useCallback(() => ({
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': data?.title ? 'modal-title' : undefined,
    'aria-describedby': data?.description ? 'modal-description' : undefined,
    onClick: (e) => e.stopPropagation(),
  }), [data]);

  // Get close button props
  const getCloseButtonProps = useCallback(() => ({
    onClick: close,
    'aria-label': 'Close modal',
    type: 'button',
  }), [close]);

  // Get title props
  const getTitleProps = useCallback(() => ({
    id: 'modal-title',
  }), []);

  // Get description props
  const getDescriptionProps = useCallback(() => ({
    id: 'modal-description',
  }), []);

  return {
    // State
    isOpen,
    data,
    
    // Actions
    open,
    close,
    toggle,
    setData,
    
    // Props helpers
    getModalProps,
    getBackdropProps,
    getCloseButtonProps,
    getTitleProps,
    getDescriptionProps,
  };
}
