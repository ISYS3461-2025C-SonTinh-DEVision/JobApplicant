/**
 * Modal Content Component
 * 
 * Main modal content wrapper.
 * Stops click propagation to prevent overlay click.
 */
import React from 'react';
import { useModalContext } from '../context/ModalContext';

export default function Content({
    children,
    className,
    as: Component = 'div',
    ...props
}) {
    const { getContentProps, isOpen } = useModalContext();

    if (!isOpen) {
        return null;
    }

    return (
        <Component
            className={className}
            {...getContentProps()}
            {...props}
        >
            {children}
        </Component>
    );
}
