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
import { JMConnectionProvider } from './context/JMConnectionContext';
import router from './routes/routeConfig';
import CookieConsentBanner from './components/common/CookieConsentBanner';

function App() {
  return (
    <ThemeProvider>
      <JMConnectionProvider>
        <AuthProvider>
          <NotificationProvider>
            <AdminAuthProvider>
              <RouterProvider router={router} />
              <CookieConsentBanner />
            </AdminAuthProvider>
          </NotificationProvider>
        </AuthProvider>
      </JMConnectionProvider>
    </ThemeProvider>
  );
}

export default App;
