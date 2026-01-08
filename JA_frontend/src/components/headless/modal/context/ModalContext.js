/**
 * Modal Context
 * 
 * Provides shared modal state for all Modal child components.
 */
import { createContext, useContext } from 'react';

const ModalContext = createContext(null);

export const useModalContext = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('Modal components must be used within a Modal provider');
    }
    return context;
};

export const ModalProvider = ModalContext.Provider;

export default ModalContext;
