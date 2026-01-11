/**
 * Global Auth Animation Component
 * 
 * Wrapper component that renders login/logout animations globally.
 * Used at App level to ensure animations work across all routes.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginLoadingAnimation from '../auth/LoginLoadingAnimation';

export default function GlobalAuthAnimation() {
    const navigate = useNavigate();
    const {
        showLogoutAnimation,
        performLogout
    } = useAuth();

    const handleLogoutAnimationComplete = async () => {
        // Clear auth state and navigate to login
        await performLogout();
        navigate('/login', { replace: true });
    };

    return (
        <LoginLoadingAnimation
            isVisible={showLogoutAnimation}
            onComplete={handleLogoutAnimationComplete}
            duration={2200}
            message="Signing out safely..."
        />
    );
}

