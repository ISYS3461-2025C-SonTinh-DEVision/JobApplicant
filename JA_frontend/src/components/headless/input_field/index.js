/**
 * InputField Headless Component - Public Exports
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Folder Structure:
 * input_field/
 * ├── InputField.jsx       # Main component
 * ├── child_components/    # Sub-components
 * │   ├── Label.jsx
 * │   ├── Input.jsx
 * │   └── Error.jsx
 * ├── context/             # React Context
 * │   └── InputFieldContext.js
 * ├── hooks/               # Custom hooks
 * │   └── useInputField.js
 * └── index.js             # This file - exports
 */

// Main component
export { default as InputField } from './InputField';
export { default } from './InputField';

// Hook for standalone usage
export { default as useInputField } from './hooks/useInputField';

// Context for advanced usage
export {
    useInputFieldContext,
    InputFieldProvider
} from './context/InputFieldContext';

// Child components for custom composition
export { default as InputFieldLabel } from './child_components/Label';
export { default as InputFieldInput } from './child_components/Input';
export { default as InputFieldError } from './child_components/Error';
