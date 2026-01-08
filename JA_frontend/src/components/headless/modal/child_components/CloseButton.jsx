/**
 * Modal CloseButton Component
 * 
 * Close button with accessibility props.
 */
import React from 'react';
import { useModalContext } from '../context/ModalContext';

export default function CloseButton({
    children,
    className,
    as: Component = 'button',
    ...props
}) {
    const { getCloseButtonProps } = useModalContext();

    return (
        <Component
            className={className}
            type="button"
            {...getCloseButtonProps()}
            {...props}
        >
            {children}
        </Component>
    );
}
