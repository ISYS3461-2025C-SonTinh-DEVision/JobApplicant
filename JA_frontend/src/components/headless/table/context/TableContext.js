/**
 * Table Context
 * 
 * Provides shared table state for all Table child components.
 */
import { createContext, useContext } from 'react';

const TableContext = createContext(null);

export const useTableContext = () => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error('Table components must be used within a Table provider');
    }
    return context;
};

export const TableProvider = TableContext.Provider;

export default TableContext;
