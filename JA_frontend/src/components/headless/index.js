/**
 * Headless UI Components Index
 * 
 * These hooks provide logic-only functionality without any UI rendering.
 * Components consuming these hooks can render their own UI while using
 * the shared logic (state management, handlers, utilities).
 * 
 * Architecture: A.3.a (Ultimo Frontend) - Headless UI Pattern
 */

export { default as useHeadlessForm } from './HeadlessForm';
export { default as useHeadlessModal } from './HeadlessModal';
export { default as useHeadlessTable } from './HeadlessTable';
export { default as useHeadlessPagination } from './HeadlessPagination';
export { default as useHeadlessSearch } from './HeadlessSearch';
export { default as useHeadlessDataList } from './HeadlessDataList';
export { default as useHeadlessNotification } from './HeadlessNotification';
export { default as useHeadlessTabs } from './HeadlessTabs';
export { default as useHeadlessToggle } from './HeadlessToggle';

