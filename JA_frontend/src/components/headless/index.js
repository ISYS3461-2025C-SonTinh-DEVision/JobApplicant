/**
 * Headless UI Components Index
 * 
 * These components and hooks provide logic-only functionality without any UI rendering.
 * Components consuming these can render their own UI while using the shared logic.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 * 
 * Each headless component follows this folder structure:
 * component_name/
 * ├── ComponentName.jsx       # Main headless component
 * ├── child_components/       # Sub-components
 * ├── context/                # React Context
 * ├── hooks/                  # Custom hooks
 * └── index.js                # Exports
 */

// =============================================================================
// NEW FOLDER-BASED HEADLESS COMPONENTS (Ultimo Architecture A.3.a)
// =============================================================================

// InputField - Headless input field with validation
export {
    InputField,
    useInputField,
    useInputFieldContext,
    InputFieldLabel,
    InputFieldInput,
    InputFieldError,
} from './input_field';

// Form - Headless form with validation and submission
export {
    Form,
    useForm,
    useFormContext,
    FormField,
    FormFieldError,
    FormSubmit,
    FormGroup,
} from './form';

// Table - Headless table with sorting, selection, expansion
export {
    Table,
    useTable,
    useTableContext,
    TableHeader,
    TableHeaderCell,
    TableBody,
    TableRow,
    TableCell,
} from './table';

// Modal - Headless modal with portal, escape handling
export {
    Modal,
    useModal,
    useModalContext,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
} from './modal';

// Tabs - Headless tabs with keyboard navigation
export {
    Tabs,
    useTabs,
    useTabsContext,
    TabList,
    Tab,
    TabPanel,
} from './tabs';


// =============================================================================
// LEGACY HOOKS (kept for backward compatibility)
// These will be deprecated in favor of the new folder-based structure
// =============================================================================

// Legacy exports - pointing to new locations
export { useForm as useHeadlessForm } from './form';
export { useModal as useHeadlessModal } from './modal';
export { useTable as useHeadlessTable } from './table';
export { useTabs as useHeadlessTabs } from './tabs';

// Legacy hooks that haven't been migrated yet
export { default as useHeadlessPagination } from './HeadlessPagination';
export { default as useHeadlessSearch } from './HeadlessSearch';
export { default as useHeadlessDataList } from './HeadlessDataList';
export { default as useHeadlessNotification } from './HeadlessNotification';
export { default as useHeadlessToggle } from './HeadlessToggle';
