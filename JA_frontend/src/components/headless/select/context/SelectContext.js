/**
 * Select Context
 * 
 * Provides select state to child components.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */
import { createContext, useContext } from 'react';

const SelectContext = createContext(null);

export function SelectProvider({ children, value }) {
    return (
        <SelectContext.Provider value={value}>
            {children}
        </SelectContext.Provider>
    );
}

export function useSelectContext() {
    const context = useContext(SelectContext);
    if (!context) {
        throw new Error('useSelectContext must be used within a Select component');
    }
    return context;
}

export default SelectContext;
