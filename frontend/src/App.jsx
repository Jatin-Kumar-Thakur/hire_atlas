import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApplicationProvider } from './context/ApplicationContext';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './components/Layout/AppLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import KanbanPage from './pages/KanbanPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
  </div>
);

/**
 * Guards protected routes.
 * Shows a full-page spinner during the initial auth check so the user
 * never sees a flash of the wrong page on hard refresh.
 * Renders AppLayout (with Outlet) once authenticated.
 */
const ProtectedLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

/**
 * Guards public-only routes (login / register).
 * Redirects to /dashboard if already authenticated.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    {/* ── Public routes ─────────────────────────────── */}
    <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
    {/* Reset password is accessible whether logged in or not */}
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
    {/* Legal pages — always public */}
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/terms"   element={<TermsPage />} />

    {/* ── Protected routes (inside AppLayout) ──────── */}
    <Route element={<ProtectedLayout />}>
      <Route path="/dashboard"    element={<DashboardPage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="/kanban"       element={<KanbanPage />} />
      <Route path="/analytics"    element={<AnalyticsPage />} />
      <Route path="/settings"     element={<SettingsPage />} />
    </Route>

    {/* ── Fallbacks ─────────────────────────────────── */}
    <Route path="/"  element={<Navigate to="/dashboard" replace />} />
    <Route path="*"  element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ApplicationProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </ApplicationProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1f2937', color: '#f9fafb' },
          success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
