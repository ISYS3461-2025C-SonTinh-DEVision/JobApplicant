/**
 * Styled Components Index
 * 
 * Pre-styled versions of headless components using Tailwind CSS.
 * These components use the headless UI pattern internally but provide
 * ready-to-use styled versions with the DEVision design system.
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI with styled layer
 */

// Form styled components
export {
    StyledForm,
    StyledFormField,
    StyledFormFieldError,
    StyledFormSubmit,
    StyledFormGroup,
    Form,
} from './StyledForm';

// InputField styled components
export {
    StyledInputField,
    InputField,
} from './StyledInputField';

// Select styled components
export {
    StyledSelect,
    Select,
    useSelect,
} from './StyledSelect';

// Checkbox styled components
export {
    StyledCheckbox,
    Checkbox,
    useCheckbox,
} from './StyledCheckbox';

// Toggle styled components
export { StyledToggle } from './StyledToggle';
