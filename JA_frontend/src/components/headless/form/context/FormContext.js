/**
 * Form Context
 * 
 * Provides shared form state for all Form child components.
 * Enables deep nesting without prop drilling.
 */
import { createContext, useContext } from 'react';

const FormContext = createContext(null);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('Form components must be used within a Form provider');
    }
    return context;
};

export const FormProvider = FormContext.Provider;

export default FormContext;
