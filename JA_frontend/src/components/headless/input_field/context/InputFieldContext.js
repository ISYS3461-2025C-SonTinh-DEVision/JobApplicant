/**
 * InputField Context
 * 
 * Provides shared state for InputField headless component.
 * Allows child components to access field state without prop drilling.
 */
import { createContext, useContext } from 'react';

const InputFieldContext = createContext(null);

export const useInputFieldContext = () => {
    const context = useContext(InputFieldContext);
    if (!context) {
        throw new Error('InputField components must be used within an InputField provider');
    }
    return context;
};

export const InputFieldProvider = InputFieldContext.Provider;

export default InputFieldContext;
