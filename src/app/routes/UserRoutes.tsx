import React from 'react';
import { Route } from 'react-router-dom';
import About from '../../features/about/pages/About';
import AuthPage from '../../features/auth/pages/AuthPage';
import ProfilePage from '../../features/profile/pages/ProfilePage';
import SettingsPage from '../../features/settings/pages/SettingsPage';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAppInit } from '../useAppInit';

interface UserRoutesProps {
  appState: ReturnType<typeof useAppInit>;
}

export const useUserRoutes = ({ appState }: UserRoutesProps) => {
  const { settings, botToken } = appState;

  return (
    <>
      <Route path="/about" element={<About />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage
              settings={settings.settings}
              setSettings={settings.setSettings}
              saveSettings={settings.saveSettings}
              botToken={botToken}
              canEditSuffix={settings.canEditSuffix}
            />
          </ProtectedRoute>
        } 
      />
    </>
  );
};
