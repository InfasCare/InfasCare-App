import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AppState,
  Appearance,
  ColorSchemeName,
  Linking,
  Platform,
} from 'react-native';

export type AppLanguage = 'pt' | 'en' | 'es';

export type AppThemeMode = 'system' | 'light' | 'dark';

export type SettingsState = {
  notificationsEnabled: boolean;
  criticalAlertsEnabled: boolean;
  soundsEnabled: boolean;
  vibrationEnabled: boolean;
  locationEnabled: boolean;
  biometricsEnabled: boolean;
  usageAnalyticsEnabled: boolean;
  saveHistoryEnabled: boolean;
  shareWithGuardiansEnabled: boolean;
  language: AppLanguage;
  themeMode: AppThemeMode;
};

export type PermissionResult = {
  granted: boolean;
  message?: string;
};

type SettingsContextValue = {
  settings: SettingsState;
  hydrated: boolean;
  isExpoGo: boolean;
  resolvedColorScheme: 'light' | 'dark';

  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => Promise<void>;

  requestNotifications: () => Promise<PermissionResult>;
  requestLocation: () => Promise<PermissionResult>;
  enableBiometrics: () => Promise<PermissionResult>;
  authenticateWithBiometrics: () => Promise<boolean>;
  openSystemSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
};

const STORAGE_KEY = '@InfasCare:settings:v1';

export const DEFAULT_SETTINGS: SettingsState = {
  notificationsEnabled: false,
  criticalAlertsEnabled: true,
  soundsEnabled: true,
  vibrationEnabled: true,
  locationEnabled: false,
  biometricsEnabled: false,
  usageAnalyticsEnabled: false,
  saveHistoryEnabled: true,
  shareWithGuardiansEnabled: true,
  language: 'pt',
  themeMode: 'system',
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Identifica se o projeto está sendo executado no Expo Go.
 *
 * No Android, o Expo Go não oferece suporte às notificações push
 * remotas do expo-notifications desde o SDK 53.
 */
function checkExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Faz o carregamento dinâmico de expo-notifications.
 *
 * O import não fica no início do arquivo para evitar que o módulo
 * seja inicializado automaticamente dentro do Expo Go.
 */
async function loadNotificationsModule() {
  if (checkExpoGo()) {
    return null;
  }

  try {
    return await import('expo-notifications');
  } catch (error) {
    console.warn(
      'Não foi possível carregar o módulo de notificações:',
      error,
    );

    return null;
  }
}

/**
 * Cria ou atualiza os canais de notificações no Android.
 */
async function configureAndroidNotificationChannels(
  settings: SettingsState,
) {
  if (Platform.OS !== 'android' || checkExpoGo()) {
    return;
  }

  const Notifications = await loadNotificationsModule();

  if (!Notifications) {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(
      'infantcare-default',
      {
        name: 'InfasCare',
        description: 'Notificações gerais do aplicativo',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: settings.soundsEnabled ? 'default' : undefined,
        enableVibrate: settings.vibrationEnabled,
        vibrationPattern: settings.vibrationEnabled
          ? [0, 250, 180, 250]
          : undefined,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      },
    );

    await Notifications.setNotificationChannelAsync(
      'infantcare-critical',
      {
        name: 'Alertas críticos InfasCare',
        description:
          'Alertas importantes relacionados à segurança da cadeirinha',
        importance: Notifications.AndroidImportance.MAX,
        sound: settings.soundsEnabled ? 'default' : undefined,
        enableVibrate: settings.vibrationEnabled,
        vibrationPattern: settings.vibrationEnabled
          ? [0, 400, 200, 400, 200, 500]
          : undefined,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
      },
    );
  } catch (error) {
    console.warn(
      'Não foi possível configurar os canais de notificação:',
      error,
    );
  }
}

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<SettingsState>(DEFAULT_SETTINGS);

  const [hydrated, setHydrated] = useState(false);

  const [currentSystemScheme, setCurrentSystemScheme] =
    useState<ColorSchemeName>(Appearance.getColorScheme());

  const isExpoGo = checkExpoGo();

  /**
   * Monitora mudanças do tema do próprio aparelho.
   */
  useEffect(() => {
    const appearanceSubscription =
      Appearance.addChangeListener(({ colorScheme }) => {
        setCurrentSystemScheme(colorScheme);
      });

    return () => {
      appearanceSubscription.remove();
    };
  }, []);

  /**
   * Atualiza novamente o tema quando o aplicativo volta
   * para primeiro plano.
   */
  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          setCurrentSystemScheme(Appearance.getColorScheme());
        }
      },
    );

    return () => {
      appStateSubscription.remove();
    };
  }, []);

  /**
   * Carrega as configurações salvas.
   */
  useEffect(() => {
    let mounted = true;

    async function loadSavedSettings() {
      try {
        const savedSettings =
          await AsyncStorage.getItem(STORAGE_KEY);

        let nextSettings = DEFAULT_SETTINGS;

        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);

          nextSettings = {
            ...DEFAULT_SETTINGS,
            ...parsedSettings,
          };
        }

        /*
         * O Expo Go não suporta a configuração de push remoto.
         * Portanto, a chave não deve aparecer como ativa nele.
         */
        if (checkExpoGo()) {
          nextSettings = {
            ...nextSettings,
            notificationsEnabled: false,
          };
        }

        if (mounted) {
          setSettings(nextSettings);

          await configureAndroidNotificationChannels(
            nextSettings,
          );
        }
      } catch (error) {
        console.warn(
          'Não foi possível carregar as configurações:',
          error,
        );

        if (mounted) {
          setSettings(DEFAULT_SETTINGS);
        }
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    }

    void loadSavedSettings();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Salva o estado completo das configurações.
   */
  const persistSettings = useCallback(
    async (nextSettings: SettingsState) => {
      try {
        setSettings(nextSettings);

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(nextSettings),
        );
      } catch (error) {
        console.warn(
          'Não foi possível salvar as configurações:',
          error,
        );

        throw error;
      }
    },
    [],
  );

  /**
   * Atualiza uma configuração individual.
   */
  const updateSetting = useCallback(
    async <K extends keyof SettingsState>(
      key: K,
      value: SettingsState[K],
    ) => {
      const nextSettings: SettingsState = {
        ...settings,
        [key]: value,
      };

      await persistSettings(nextSettings);

      if (
        key === 'soundsEnabled' ||
        key === 'vibrationEnabled' ||
        key === 'notificationsEnabled'
      ) {
        await configureAndroidNotificationChannels(
          nextSettings,
        );
      }
    },
    [persistSettings, settings],
  );

  /**
   * Solicita permissão real para notificações.
   */
  const requestNotifications =
    useCallback(async (): Promise<PermissionResult> => {
      if (checkExpoGo()) {
        await updateSetting(
          'notificationsEnabled',
          false,
        );

        return {
          granted: false,
          message:
            'As notificações push não funcionam no Expo Go no Android. Use uma development build para ativar esse recurso.',
        };
      }

      const Notifications =
        await loadNotificationsModule();

      if (!Notifications) {
        await updateSetting(
          'notificationsEnabled',
          false,
        );

        return {
          granted: false,
          message:
            'Não foi possível carregar o recurso de notificações.',
        };
      }

      try {
        const currentPermission =
          await Notifications.getPermissionsAsync();

        let finalStatus = currentPermission.status;

        if (finalStatus !== 'granted') {
          const requestedPermission =
            await Notifications.requestPermissionsAsync({
              ios: {
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
              },
            });

          finalStatus = requestedPermission.status;
        }

        const granted = finalStatus === 'granted';

        await updateSetting(
          'notificationsEnabled',
          granted,
        );

        if (granted) {
          await configureAndroidNotificationChannels({
            ...settings,
            notificationsEnabled: true,
          });
        }

        return {
          granted,
          message: granted
            ? undefined
            : 'A permissão de notificações foi negada. Você pode ativá-la nas configurações do aparelho.',
        };
      } catch (error) {
        console.warn(
          'Erro ao solicitar permissão de notificações:',
          error,
        );

        await updateSetting(
          'notificationsEnabled',
          false,
        );

        return {
          granted: false,
          message:
            'Não foi possível solicitar a permissão de notificações.',
        };
      }
    }, [settings, updateSetting]);

  /**
   * Solicita a permissão real de localização.
   *
   * O Expo Location está disponível no Expo Go.
   */
  const requestLocation =
    useCallback(async (): Promise<PermissionResult> => {
      try {
        const currentPermission =
          await Location.getForegroundPermissionsAsync();

        let finalStatus = currentPermission.status;

        if (finalStatus !== 'granted') {
          const requestedPermission =
            await Location.requestForegroundPermissionsAsync();

          finalStatus = requestedPermission.status;
        }

        const granted = finalStatus === 'granted';

        await updateSetting(
          'locationEnabled',
          granted,
        );

        return {
          granted,
          message: granted
            ? undefined
            : 'A localização foi negada. Ative a permissão nas configurações do aparelho.',
        };
      } catch (error) {
        console.warn(
          'Erro ao solicitar localização:',
          error,
        );

        await updateSetting(
          'locationEnabled',
          false,
        );

        return {
          granted: false,
          message:
            'Não foi possível solicitar a permissão de localização.',
        };
      }
    }, [updateSetting]);

  /**
   * Abre o prompt real de biometria.
   */
  const authenticateWithBiometrics =
    useCallback(async (): Promise<boolean> => {
      try {
        const hasHardware =
          await LocalAuthentication.hasHardwareAsync();

        if (!hasHardware) {
          return false;
        }

        const enrolled =
          await LocalAuthentication.isEnrolledAsync();

        if (!enrolled) {
          return false;
        }

        const authenticationResult =
          await LocalAuthentication.authenticateAsync({
            promptMessage: 'Confirme sua identidade',
            cancelLabel: 'Cancelar',
            fallbackLabel: 'Usar senha do aparelho',
            disableDeviceFallback: false,
          });

        return authenticationResult.success;
      } catch (error) {
        console.warn(
          'Erro durante a autenticação biométrica:',
          error,
        );

        return false;
      }
    }, []);

  /**
   * Verifica o aparelho e ativa a biometria.
   */
  const enableBiometrics =
    useCallback(async (): Promise<PermissionResult> => {
      try {
        const hasHardware =
          await LocalAuthentication.hasHardwareAsync();

        if (!hasHardware) {
          await updateSetting(
            'biometricsEnabled',
            false,
          );

          return {
            granted: false,
            message:
              'Este aparelho não possui autenticação biométrica compatível.',
          };
        }

        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (supportedTypes.length === 0) {
          await updateSetting(
            'biometricsEnabled',
            false,
          );

          return {
            granted: false,
            message:
              'Nenhum método biométrico compatível foi encontrado.',
          };
        }

        const enrolled =
          await LocalAuthentication.isEnrolledAsync();

        if (!enrolled) {
          await updateSetting(
            'biometricsEnabled',
            false,
          );

          return {
            granted: false,
            message:
              'Cadastre uma digital ou reconhecimento facial nas configurações do aparelho.',
          };
        }

        const authenticated =
          await authenticateWithBiometrics();

        await updateSetting(
          'biometricsEnabled',
          authenticated,
        );

        return {
          granted: authenticated,
          message: authenticated
            ? undefined
            : 'Não foi possível confirmar sua identidade.',
        };
      } catch (error) {
        console.warn(
          'Erro ao ativar a biometria:',
          error,
        );

        await updateSetting(
          'biometricsEnabled',
          false,
        );

        return {
          granted: false,
          message:
            'Não foi possível ativar a autenticação biométrica.',
        };
      }
    }, [
      authenticateWithBiometrics,
      updateSetting,
    ]);

  /**
   * Abre as configurações nativas do aplicativo.
   */
  const openSystemSettings =
    useCallback(async (): Promise<void> => {
      try {
        await Linking.openSettings();
      } catch (error) {
        console.warn(
          'Não foi possível abrir as configurações:',
          error,
        );
      }
    }, []);

  /**
   * Restaura todas as preferências.
   */
  const resetSettings =
    useCallback(async (): Promise<void> => {
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);

        const nextSettings = {
          ...DEFAULT_SETTINGS,
          notificationsEnabled: false,
          locationEnabled: false,
          biometricsEnabled: false,
        };

        setSettings(nextSettings);

        await configureAndroidNotificationChannels(
          nextSettings,
        );
      } catch (error) {
        console.warn(
          'Não foi possível restaurar as configurações:',
          error,
        );
      }
    }, []);

  /**
   * Resolve o tema selecionado.
   */
  const resolvedColorScheme: 'light' | 'dark' =
    settings.themeMode === 'system'
      ? currentSystemScheme === 'dark'
        ? 'dark'
        : 'light'
      : settings.themeMode;

  const contextValue =
    useMemo<SettingsContextValue>(
      () => ({
        settings,
        hydrated,
        isExpoGo,
        resolvedColorScheme,
        updateSetting,
        requestNotifications,
        requestLocation,
        enableBiometrics,
        authenticateWithBiometrics,
        openSystemSettings,
        resetSettings,
      }),
      [
        settings,
        hydrated,
        isExpoGo,
        resolvedColorScheme,
        updateSetting,
        requestNotifications,
        requestLocation,
        enableBiometrics,
        authenticateWithBiometrics,
        openSystemSettings,
        resetSettings,
      ],
    );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      'useSettings deve ser usado dentro de SettingsProvider.',
    );
  }

  return context;
}