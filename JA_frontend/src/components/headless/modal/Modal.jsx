/**
 * Modal Headless Component
 * 
 * A compound component pattern for headless modals.
 * Provides modal state management without styling.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Usage:
 * const modal = useModal();
 * 
 * <button {...modal.getTriggerProps()}>Open Modal</button>
 * 
 * <Modal controller={modal}>
 *   <Modal.Overlay className="...">
 *     <Modal.Content className="...">
 *       <Modal.Header>
 *         <h2>Title</h2>
 *         <Modal.CloseButton>×</Modal.CloseButton>
 *       </Modal.Header>
 *       <Modal.Body>Content</Modal.Body>
 *       <Modal.Footer>Actions</Modal.Footer>
 *     </Modal.Content>
 *   </Modal.Overlay>
 * </Modal>
 */
import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import { ModalProvider } from './context/ModalContext';
import useModal from './hooks/useModal';
import Overlay from './child_components/Overlay';
import Content from './child_components/Content';
import Header from './child_components/Header';
import Body from './child_components/Body';
import Footer from './child_components/Footer';
import CloseButton from './child_components/CloseButton';

function Modal({
    controller,
    defaultOpen = false,
    onOpen,
    onClose,
    closeOnEscape = true,
    closeOnOverlayClick = true,
    children,
    portal = true,
}) {
    // Use provided controller or create internal one
    const internalModal = useModal({
        defaultOpen,
        onOpen,
        onClose,
        closeOnEscape,
        closeOnOverlayClick,
    });

    const modalState = controller || internalModal;

    // Memoize context value
    const contextValue = useMemo(() => modalState, [
        modalState.isOpen,
    ]);

    // Don't render anything if not open
    if (!modalState.isOpen) {
        return null;
    }

    const content = (
        <ModalProvider value={contextValue}>
            {typeof children === 'function' ? children(modalState) : children}
        </ModalProvider>
    );

    // Portal to body by default
    if (portal) {
        return ReactDOM.createPortal(content, document.body);
    }

    return content;
}

// Attach child components for compound component pattern
Modal.Overlay = Overlay;
Modal.Content = Content;
Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.CloseButton = CloseButton;

export default Modal;
