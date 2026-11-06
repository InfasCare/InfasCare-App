import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import {
  SettingsProvider,
  useSettings,
} from '@/contexts/SettingsContext';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';

function AppStatusBar() {
  const { resolvedColorScheme } = useSettings();

  return (
    <StatusBar
      style={resolvedColorScheme === 'dark' ? 'light' : 'dark'}
    />
  );
}

export default function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SettingsProvider>
      <I18nProvider>
        <AuthProvider>
          <AppStatusBar />
          {children}
        </AuthProvider>
      </I18nProvider>
    </SettingsProvider>
  );
}