/**
 * Login/Logout Animation Component - NordVPN Style
 * 
 * Beautiful fullscreen splash animation with:
 * - Logo in center
 * - SVG ring with glow effect that scales to cover entire viewport
 * - GPU-accelerated transforms for smooth 60fps animation
 * - Cubic-bezier easing for premium feel
 */

import React, { useEffect, useState, useRef } from 'react';

export default function LoginLoadingAnimation({
    isVisible,
    onComplete,
    duration = 2200,
    message = "Preparing your dashboard..."
}) {
    const [phase, setPhase] = useState('hidden'); // hidden, intro, expanding, complete
    const [endScale, setEndScale] = useState(1);
    const containerRef = useRef(null);

    // Calculate the scale needed for ring to cover entire viewport
    useEffect(() => {
        if (isVisible) {
            const computeEndScale = () => {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                // Ring starts at 200px diameter, need to scale to cover diagonal
                const diagonal = Math.sqrt(vw * vw + vh * vh);
                const ringDiameter = 200;
                // Add 20% extra to ensure full coverage
                return (diagonal / ringDiameter) * 1.2;
            };
            setEndScale(computeEndScale());

            // Handle window resize
            const handleResize = () => setEndScale(computeEndScale());
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) {
            setPhase('hidden');
            return;
        }

        // Phase 1: Show intro (logo + initial ring)
        setPhase('intro');

        // Phase 2: Start ring expansion immediately
        const expandTimer = setTimeout(() => {
            setPhase('expanding');
        }, 300);

        // Call onComplete early to allow page transition while animation visible
        const completeTimer = setTimeout(() => {
            if (onComplete) onComplete();
        }, duration - 500);

        // Phase 3: Complete and hide
        const hideTimer = setTimeout(() => {
            setPhase('complete');
        }, duration);

        return () => {
            clearTimeout(expandTimer);
            clearTimeout(completeTimer);
            clearTimeout(hideTimer);
        };
    }, [isVisible, duration, onComplete]);

    if (phase === 'hidden') return null;

    const isExpanding = phase === 'expanding' || phase === 'complete';
    const isFading = phase === 'complete';

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden
                transition-opacity duration-500 ease-out
                ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ backgroundColor: '#0a0f1a' }}
        >
            {/* SVG Ring with Glow Filter */}
            <svg
                className="absolute"
                style={{
                    width: '200px',
                    height: '200px',
                    transform: `scale(${isExpanding ? endScale : 1})`,
                    transition: isExpanding
                        ? `transform ${duration * 0.65}ms cubic-bezier(.16, 1, .3, 1)`
                        : 'none',
                    willChange: 'transform',
                }}
            >
                {/* Glow Filter Definition */}
                <defs>
                    <filter id="ring-glow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="8" result="blur1" />
                        <feGaussianBlur stdDeviation="16" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Gradient for ring stroke */}
                    <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0099FF" />
                        <stop offset="50%" stopColor="#00D4FF" />
                        <stop offset="100%" stopColor="#0066CC" />
                    </linearGradient>
                </defs>

                {/* Outer glow ring */}
                <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="url(#ring-gradient)"
                    strokeWidth="4"
                    filter="url(#ring-glow)"
                    style={{
                        opacity: isExpanding ? 0.8 : 0,
                        transition: `opacity 0.4s ease-out`,
                    }}
                />

                {/* Main ring stroke */}
                <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="#0099FF"
                    strokeWidth="2"
                    style={{
                        opacity: isExpanding ? 1 : 0,
                        transition: `opacity 0.3s ease-out`,
                    }}
                />
            </svg>

            {/* Secondary expanding rings for depth */}
            {[1, 2].map((ring) => (
                <div
                    key={ring}
                    className="absolute rounded-full border"
                    style={{
                        width: '200px',
                        height: '200px',
                        borderColor: `rgba(0, 153, 255, ${0.3 - ring * 0.1})`,
                        borderWidth: '1px',
                        boxShadow: `0 0 ${30 - ring * 10}px rgba(0, 153, 255, ${0.2 - ring * 0.05})`,
                        transform: `scale(${isExpanding ? endScale * (0.85 + ring * 0.1) : 1})`,
                        transition: isExpanding
                            ? `transform ${duration * 0.65 + ring * 100}ms cubic-bezier(.16, 1, .3, 1) ${ring * 80}ms`
                            : 'none',
                        opacity: isExpanding ? (0.6 - ring * 0.2) : 0,
                        willChange: 'transform',
                    }}
                />
            ))}

            {/* Center content container */}
            <div
                className={`relative z-10 flex flex-col items-center transition-all duration-700
                    ${isExpanding ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                style={{
                    transitionDelay: isExpanding ? '0ms' : '200ms',
                }}
            >
                {/* Logo with pulse glow */}
                <div
                    className="relative"
                    style={{
                        animation: phase === 'intro' ? 'logo-pulse 1.5s ease-in-out infinite' : 'none',
                    }}
                >
                    {/* Logo glow backdrop */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 153, 255, 0.4) 0%, transparent 70%)',
                            transform: 'scale(2.5)',
                            filter: 'blur(20px)',
                        }}
                    />

                    <img
                        src="/favicon.png"
                        alt="DEVision"
                        className="relative w-28 h-28 md:w-36 md:h-36 object-contain"
                        style={{
                            filter: 'drop-shadow(0 0 25px rgba(0, 153, 255, 0.7))',
                        }}
                    />
                </div>

                {/* Brand name */}
                <h1
                    className={`mt-6 text-3xl md:text-4xl font-bold text-white
                        transition-all duration-500 delay-100
                        ${phase === 'intro' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
                    style={{
                        textShadow: '0 0 30px rgba(0, 153, 255, 0.6)',
                        letterSpacing: '0.05em',
                    }}
                >
                    DEVision
                </h1>

                {/* Loading message */}
                <div
                    className={`mt-6 flex items-center gap-3 transition-all duration-500 delay-200
                        ${phase === 'intro' ? 'opacity-100' : 'opacity-0'}`}
                >
                    {/* Animated dots */}
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full"
                                style={{
                                    backgroundColor: '#0099FF',
                                    animation: 'dot-bounce 1.2s ease-in-out infinite',
                                    animationDelay: `${i * 0.15}s`,
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-dark-400">{message}</span>
                </div>
            </div>

            {/* CSS Keyframes */}
            <style>{`
                @keyframes logo-pulse {
                    0%, 100% {
                        filter: drop-shadow(0 0 25px rgba(0, 153, 255, 0.7));
                    }
                    50% {
                        filter: drop-shadow(0 0 40px rgba(0, 153, 255, 0.9));
                    }
                }

                @keyframes dot-bounce {
                    0%, 80%, 100% {
                        transform: scale(0.7);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1.1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}


