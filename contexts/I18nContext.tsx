import { AppLanguage, useSettings } from '@/contexts/SettingsContext';
import { createContext, ReactNode, useContext, useMemo } from 'react';

const translations = {
  pt: {
    settings: 'Configurações',
    settingsSubtitle: 'Personalize sua experiência no InfantCare',
    notifications: 'Notificações',
    notificationsDescription: 'Receber avisos do aplicativo',
    criticalAlerts: 'Alertas críticos',
    criticalAlertsDescription: 'Avisos importantes sobre a cadeirinha',
    sounds: 'Sons',
    soundsDescription: 'Reproduzir som ao receber alertas',
    vibration: 'Vibração',
    vibrationDescription: 'Vibrar ao receber notificações',
    securityPrivacy: 'Segurança e privacidade',
    location: 'Localização',
    locationDescription: 'Permitir acesso à localização do dispositivo',
    biometric: 'Acesso por biometria',
    biometricDescription: 'Usar digital ou reconhecimento facial',
    changePassword: 'Alterar senha',
    changePasswordDescription: 'Atualize a senha da sua conta',
    privacy: 'Privacidade',
    privacyDescription: 'Gerencie seus dados e permissões',
    preferences: 'Preferências',
    language: 'Idioma',
    appearance: 'Aparência',
    support: 'Suporte',
    helpCenter: 'Central de ajuda',
    sendFeedback: 'Enviar feedback',
    aboutApp: 'Sobre o aplicativo',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Escuro',
    portuguese: 'Português',
    english: 'Inglês',
    spanish: 'Espanhol',
    chooseLanguage: 'Escolha o idioma',
    chooseAppearance: 'Escolha a aparência',
    understood: 'Entendi',
    permissionDenied: 'Permissão não concedida',
    activated: 'Recurso ativado',
    deactivated: 'Recurso desativado',
    openSystemSettings: 'Abrir configurações do aparelho',
    cancel: 'Cancelar',
  },
  en: {
    settings: 'Settings',
    settingsSubtitle: 'Customize your InfantCare experience',
    notifications: 'Notifications',
    notificationsDescription: 'Receive app notifications',
    criticalAlerts: 'Critical alerts',
    criticalAlertsDescription: 'Important car seat alerts',
    sounds: 'Sounds',
    soundsDescription: 'Play sounds for alerts',
    vibration: 'Vibration',
    vibrationDescription: 'Vibrate for notifications',
    securityPrivacy: 'Security and privacy',
    location: 'Location',
    locationDescription: 'Allow device location access',
    biometric: 'Biometric access',
    biometricDescription: 'Use fingerprint or face recognition',
    changePassword: 'Change password',
    changePasswordDescription: 'Update your account password',
    privacy: 'Privacy',
    privacyDescription: 'Manage your data and permissions',
    preferences: 'Preferences',
    language: 'Language',
    appearance: 'Appearance',
    support: 'Support',
    helpCenter: 'Help center',
    sendFeedback: 'Send feedback',
    aboutApp: 'About the app',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    portuguese: 'Portuguese',
    english: 'English',
    spanish: 'Spanish',
    chooseLanguage: 'Choose language',
    chooseAppearance: 'Choose appearance',
    understood: 'Got it',
    permissionDenied: 'Permission not granted',
    activated: 'Feature enabled',
    deactivated: 'Feature disabled',
    openSystemSettings: 'Open device settings',
    cancel: 'Cancel',
  },
  es: {
    settings: 'Configuración',
    settingsSubtitle: 'Personaliza tu experiencia en InfantCare',
    notifications: 'Notificaciones',
    notificationsDescription: 'Recibir avisos de la aplicación',
    criticalAlerts: 'Alertas críticas',
    criticalAlertsDescription: 'Avisos importantes sobre la silla',
    sounds: 'Sonidos',
    soundsDescription: 'Reproducir sonido al recibir alertas',
    vibration: 'Vibración',
    vibrationDescription: 'Vibrar al recibir notificaciones',
    securityPrivacy: 'Seguridad y privacidad',
    location: 'Ubicación',
    locationDescription: 'Permitir acceso a la ubicación',
    biometric: 'Acceso biométrico',
    biometricDescription: 'Usar huella o reconocimiento facial',
    changePassword: 'Cambiar contraseña',
    changePasswordDescription: 'Actualiza la contraseña de tu cuenta',
    privacy: 'Privacidad',
    privacyDescription: 'Gestiona tus datos y permisos',
    preferences: 'Preferencias',
    language: 'Idioma',
    appearance: 'Apariencia',
    support: 'Soporte',
    helpCenter: 'Centro de ayuda',
    sendFeedback: 'Enviar comentarios',
    aboutApp: 'Acerca de la aplicación',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
    portuguese: 'Portugués',
    english: 'Inglés',
    spanish: 'Español',
    chooseLanguage: 'Elige el idioma',
    chooseAppearance: 'Elige la apariencia',
    understood: 'Entendido',
    permissionDenied: 'Permiso no concedido',
    activated: 'Función activada',
    deactivated: 'Función desactivada',
    openSystemSettings: 'Abrir configuración del dispositivo',
    cancel: 'Cancelar',
  },
} as const;

type TranslationKey = keyof typeof translations.pt;

type I18nContextValue = {
  language: AppLanguage;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  const value = useMemo<I18nContextValue>(
    () => ({
      language: settings.language,
      t: (key) => translations[settings.language][key] ?? translations.pt[key],
    }),
    [settings.language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n deve ser usado dentro de I18nProvider.');
  }

  return context;
}
