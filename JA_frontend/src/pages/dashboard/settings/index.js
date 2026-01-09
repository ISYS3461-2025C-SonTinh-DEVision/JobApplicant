/**
 * Settings Page Module Exports
 * 
 * Exports for the settings page and its components.
 * 
 * Architecture: A.2.b (Componentized Frontend)
 */

// Main page
export { default as SettingsPage } from './SettingsPage';
export { default } from './SettingsPage';

// Settings components
export { default as GeneralSettings } from './components/GeneralSettings';
export { default as NotificationSettings } from './components/NotificationSettings';
export { default as AppearanceSettings } from './components/AppearanceSettings';
export { default as PrivacySettings } from './components/PrivacySettings';
export { default as LegalSettings } from './components/LegalSettings';

// Legal documents
export { default as TermsOfService } from './legal/TermsOfService';
export { default as PrivacyPolicy } from './legal/PrivacyPolicy';
export { default as CookiePolicy } from './legal/CookiePolicy';
export { default as Disclaimer } from './legal/Disclaimer';
export { default as RefundPolicy } from './legal/RefundPolicy';
export { default as FAQ } from './legal/FAQ';
