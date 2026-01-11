/**
 * Cat Loading Spinner Component
 * 
 * Uses dotLottie animation for a cute cat loading indicator.
 * Replaces boring spinners with adorable cat animation.
 */

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * CatLoadingSpinner - Animated cat loading indicator
 * @param {string} size - Size variant: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} message - Optional loading message
 * @param {boolean} fullScreen - Whether to show fullscreen with background
 * @param {string} className - Additional CSS classes
 */
export default function CatLoadingSpinner({
    size = 'md',
    message = null,
    fullScreen = false,
    className = ''
}) {
    // Size mappings
    const sizeMap = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48'
    };

    const content = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={sizeMap[size] || sizeMap.md}>
                <DotLottieReact
                    src="/animations/cat-loading.lottie"
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            {message && (
                <p className="mt-4 text-dark-300 text-sm animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return content;
}

/**
 * FullScreenCatLoader - Fullscreen loading overlay
 */
export function FullScreenCatLoader({ message = "Loading..." }) {
    return (
        <div className="fixed inset-0 z-50 bg-dark-900/95 backdrop-blur-sm flex items-center justify-center">
            <CatLoadingSpinner size="xl" message={message} />
        </div>
    );
}

/**
 * InlineCatLoader - Small inline loading indicator
 */
export function InlineCatLoader({ size = 'sm' }) {
    return <CatLoadingSpinner size={size} />;
}
