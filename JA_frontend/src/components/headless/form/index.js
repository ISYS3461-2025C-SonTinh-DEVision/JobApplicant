/**
 * Form Headless Component - Public Exports
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Folder Structure:
 * form/
 * ├── Form.jsx             # Main component
 * ├── child_components/    # Sub-components
 * │   ├── Field.jsx
 * │   ├── FieldError.jsx
 * │   ├── Submit.jsx
 * │   └── Group.jsx
 * ├── context/             # React Context
 * │   └── FormContext.js
 * ├── hooks/               # Custom hooks
 * │   └── useForm.js
 * └── index.js             # This file
 */

// Main component
export { default as Form } from './Form';
export { default } from './Form';

// Hook for standalone usage
export { default as useForm } from './hooks/useForm';

// Context for advanced usage
export {
    useFormContext,
    FormProvider
} from './context/FormContext';

// Child components for custom composition
export { default as FormField } from './child_components/Field';
export { default as FormFieldError } from './child_components/FieldError';
export { default as FormSubmit } from './child_components/Submit';
export { default as FormGroup } from './child_components/Group';
