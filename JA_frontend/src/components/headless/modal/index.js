/**
 * Modal Headless Component - Public Exports
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

// Main component
export { default as Modal } from './Modal';
export { default } from './Modal';

// Hook for standalone usage
export { default as useModal } from './hooks/useModal';

// Context for advanced usage
export {
    useModalContext,
    ModalProvider
} from './context/ModalContext';

// Child components for custom composition
export { default as ModalOverlay } from './child_components/Overlay';
export { default as ModalContent } from './child_components/Content';
export { default as ModalHeader } from './child_components/Header';
export { default as ModalBody } from './child_components/Body';
export { default as ModalFooter } from './child_components/Footer';
export { default as ModalCloseButton } from './child_components/CloseButton';
