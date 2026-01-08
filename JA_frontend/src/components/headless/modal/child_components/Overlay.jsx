/**
 * Modal Overlay Component
 * 
 * Backdrop/overlay that appears behind the modal.
 * Clicking on overlay closes the modal (if enabled).
 */
import React from 'react';
import { useModalContext } from '../context/ModalContext';

export default function Overlay({
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    const { getOverlayProps, isOpen } = useModalContext();

    if (!isOpen) {
        return null;
    }

    return (
        <Component
            className={className}
            {...getOverlayProps()}
            {...props}
        >
            {children}
        </Component>
    );
}
