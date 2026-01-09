/**
 * Main Application Component
 * Sets up providers and routing
 */

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import router from './routes/routeConfig';
import CookieConsentBanner from './components/common/CookieConsentBanner';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AdminAuthProvider>
            <RouterProvider router={router} />
            <CookieConsentBanner />
          </AdminAuthProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
