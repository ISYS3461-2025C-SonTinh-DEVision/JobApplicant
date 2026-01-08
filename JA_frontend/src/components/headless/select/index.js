/**
 * Select Headless Component - Public Exports
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

// Main component
export { default as Select } from './Select';
export { default } from './Select';

// Hook for standalone usage
export { default as useSelect } from './hooks/useSelect';

// Context for advanced usage
export {
    useSelectContext,
    SelectProvider
} from './context/SelectContext';

// Child components for custom composition
export { default as SelectTrigger } from './child_components/Trigger';
export { default as SelectOptions } from './child_components/Options';
export { default as SelectOption } from './child_components/Option';
