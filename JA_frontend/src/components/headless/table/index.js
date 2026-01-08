/**
 * Table Headless Component - Public Exports
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

// Main component
export { default as Table } from './Table';
export { default } from './Table';

// Hook for standalone usage
export { default as useTable } from './hooks/useTable';

// Context for advanced usage
export {
    useTableContext,
    TableProvider
} from './context/TableContext';

// Child components for custom composition
export { default as TableHeader } from './child_components/Header';
export { default as TableHeaderCell } from './child_components/HeaderCell';
export { default as TableBody } from './child_components/Body';
export { default as TableRow } from './child_components/Row';
export { default as TableCell } from './child_components/Cell';
