import FeedbackModal from '@/components/FeedbackModal';
import { useI18n } from '@/contexts/I18nContext';
import {
  AppLanguage,
  AppThemeMode,
  useSettings,
} from '@/contexts/SettingsContext';
import { useTheme } from '@/hooks/use-theme-color';
import { sendInfantCareAlert } from '@/services/notifications';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type OptionModal = 'language' | 'theme' | null;

type FeedbackState = {
  visible: boolean;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  showSettingsButton?: boolean;
};

export default function Configuracoes() {
  const theme = useTheme();
  const { t } = useI18n();
  const {
    settings,
    updateSetting,
    requestNotifications,
    requestLocation,
    enableBiometrics,
    openSystemSettings,
  } = useSettings();

  const [modal, setModal] = useState<OptionModal>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  function voltar() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/perfil');
  }

  async function toggleNotifications(value: boolean) {
    if (!value) {
      await updateSetting('notificationsEnabled', false);
      return;
    }

    const result = await requestNotifications();

    if (!result.granted) {
      setFeedback({
        visible: true,
        title: t('permissionDenied'),
        message: result.message ?? '',
        type: 'warning',
        showSettingsButton: true,
      });
      return;
    }

    setFeedback({
      visible: true,
      title: t('activated'),
      message: 'As notificações do InfantCare estão ativadas.',
      type: 'success',
    });
  }

  async function toggleLocation(value: boolean) {
    if (!value) {
      await updateSetting('locationEnabled', false);
      return;
    }

    const result = await requestLocation();

    if (!result.granted) {
      setFeedback({
        visible: true,
        title: t('permissionDenied'),
        message: result.message ?? '',
        type: 'warning',
        showSettingsButton: true,
      });
    }
  }

  async function toggleBiometrics(value: boolean) {
    if (!value) {
      await updateSetting('biometricsEnabled', false);
      return;
    }

    const result = await enableBiometrics();

    setFeedback({
      visible: true,
      title: result.granted ? t('activated') : t('permissionDenied'),
      message:
        result.message ??
        'A autenticação biométrica foi ativada para o InfantCare.',
      type: result.granted ? 'success' : 'warning',
      showSettingsButton: !result.granted,
    });
  }

  async function sendTestNotification() {
    const id = await sendInfantCareAlert(
      {
        title: 'InfantCare',
        body: 'Notificação de teste enviada com sucesso.',
      },
      settings,
    );

    setFeedback({
      visible: true,
      title: id ? 'Teste enviado' : 'Notificações desativadas',
      message: id
        ? 'A notificação aparecerá em instantes.'
        : 'Ative as notificações para realizar o teste.',
      type: id ? 'success' : 'warning',
    });
  }

  const languageLabel: Record<AppLanguage, string> = {
    pt: t('portuguese'),
    en: t('english'),
    es: t('spanish'),
  };

  const themeLabel: Record<AppThemeMode, string> = {
    system: t('system'),
    light: t('light'),
    dark: t('dark'),
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.backgroundSoft }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Header
          title={t('settings')}
          subtitle={t('settingsSubtitle')}
          theme={theme}
          onBack={voltar}
        />

        <SectionTitle title={t('notifications')} theme={theme} />

        <Card theme={theme}>
          <SwitchItem
            icon="notifications-outline"
            title={t('notifications')}
            description={t('notificationsDescription')}
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            theme={theme}
          />
          <Divider theme={theme} />
          <SwitchItem
            icon="warning-outline"
            title={t('criticalAlerts')}
            description={t('criticalAlertsDescription')}
            value={settings.criticalAlertsEnabled}
            disabled={!settings.notificationsEnabled}
            onValueChange={(value: boolean) =>
              updateSetting('criticalAlertsEnabled', value)
            }
            theme={theme}
          />
          <Divider theme={theme} />
          <SwitchItem
            icon="volume-high-outline"
            title={t('sounds')}
            description={t('soundsDescription')}
            value={settings.soundsEnabled}
            onValueChange={(value: boolean) =>
              updateSetting('soundsEnabled', value)
            }
            theme={theme}
          />
          <Divider theme={theme} />
          <SwitchItem
            icon="phone-portrait-outline"
            title={t('vibration')}
            description={t('vibrationDescription')}
            value={settings.vibrationEnabled}
            onValueChange={(value: boolean) =>
              updateSetting('vibrationEnabled', value)
            }
            theme={theme}
          />
          <Divider theme={theme} />
          <MenuItem
            icon="paper-plane-outline"
            title="Testar notificação"
            description="Envie uma notificação local para este aparelho"
            onPress={sendTestNotification}
            theme={theme}
          />
        </Card>

        <SectionTitle title={t('securityPrivacy')} theme={theme} />

        <Card theme={theme}>
          <SwitchItem
            icon="location-outline"
            title={t('location')}
            description={t('locationDescription')}
            value={settings.locationEnabled}
            onValueChange={toggleLocation}
            theme={theme}
          />
          <Divider theme={theme} />
          <SwitchItem
            icon="finger-print-outline"
            title={t('biometric')}
            description={t('biometricDescription')}
            value={settings.biometricsEnabled}
            onValueChange={toggleBiometrics}
            theme={theme}
          />
          <Divider theme={theme} />
          <MenuItem
            icon="lock-closed-outline"
            title={t('changePassword')}
            description={t('changePasswordDescription')}
            onPress={() => router.push('/(settings)/alterar-senha')}
            theme={theme}
          />
          <Divider theme={theme} />
          <MenuItem
            icon="shield-checkmark-outline"
            title={t('privacy')}
            description={t('privacyDescription')}
            onPress={() => router.push('/(settings)/privacidade')}
            theme={theme}
          />
        </Card>

        <SectionTitle title={t('preferences')} theme={theme} />

        <Card theme={theme}>
          <MenuItem
            icon="language-outline"
            title={t('language')}
            description={languageLabel[settings.language]}
            onPress={() => setModal('language')}
            theme={theme}
          />
          <Divider theme={theme} />
          <MenuItem
            icon="color-palette-outline"
            title={t('appearance')}
            description={themeLabel[settings.themeMode]}
            onPress={() => setModal('theme')}
            theme={theme}
          />
        </Card>

        <SectionTitle title={t('support')} theme={theme} />

        <Card theme={theme}>
          <MenuItem
            icon="help-circle-outline"
            title={t('helpCenter')}
            description="Dúvidas frequentes e suporte"
            onPress={() => router.push('/(settings)/suporte')}
            theme={theme}
          />
          <Divider theme={theme} />
          <MenuItem
            icon="chatbubble-ellipses-outline"
            title={t('sendFeedback')}
            description="Conte como podemos melhorar"
            onPress={() => router.push('/(settings)/feedback')}
            theme={theme}
          />
          <Divider theme={theme} />
          <MenuItem
            icon="information-circle-outline"
            title={t('aboutApp')}
            description="Versão, termos e informações"
            onPress={() => router.push('/(settings)/sobre')}
            theme={theme}
          />
        </Card>

        <View style={[styles.versionCard, { backgroundColor: theme.backgroundCard }]}>
          <View style={[styles.logoCircle, { backgroundColor: theme.accentSoft }]}>
            <Ionicons name="shield-checkmark-outline" size={24} color={theme.accent} />
          </View>
          <View>
            <Text style={[styles.appName, { color: theme.text }]}>InfantCare</Text>
            <Text style={[styles.versionText, { color: theme.textSecondary }]}>
              Versão 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      <SelectionModal
        visible={modal === 'language'}
        title={t('chooseLanguage')}
        options={[
          { value: 'pt', label: 'Português' },
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Español' },
        ]}
        selected={settings.language}
        onSelect={async (value: AppLanguage) => {
          await updateSetting('language', value);
          setModal(null);
        }}
        onClose={() => setModal(null)}
        theme={theme}
      />

      <SelectionModal
        visible={modal === 'theme'}
        title={t('chooseAppearance')}
        options={[
          { value: 'system', label: t('system') },
          { value: 'light', label: t('light') },
          { value: 'dark', label: t('dark') },
        ]}
        selected={settings.themeMode}
        onSelect={async (value: AppThemeMode) => {
          await updateSetting('themeMode', value);
          setModal(null);
        }}
        onClose={() => setModal(null)}
        theme={theme}
      />

      <FeedbackModal
        visible={feedback.visible}
        title={feedback.title}
        message={feedback.message}
        type={feedback.type}
        confirmText={
          feedback.showSettingsButton
            ? t('openSystemSettings')
            : t('understood')
        }
        cancelText={t('cancel')}
        showCancel={Boolean(feedback.showSettingsButton)}
        theme={theme}
        onConfirm={async () => {
          if (feedback.showSettingsButton) {
            await openSystemSettings();
          }

          setFeedback((current) => ({ ...current, visible: false }));
        }}
        onCancel={() =>
          setFeedback((current) => ({ ...current, visible: false }))
        }
      />
    </View>
  );
}

function Header({ title, subtitle, theme, onBack }: any) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: theme.backgroundCard }]}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={22} color={theme.text} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );
}

function SectionTitle({ title, theme }: any) {
  return (
    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
      {title}
    </Text>
  );
}

function Card({ children, theme }: any) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.backgroundCard }]}>
      {children}
    </View>
  );
}

function Divider({ theme }: any) {
  return (
    <View style={[styles.divider, { backgroundColor: theme.borderInput }]} />
  );
}

function SwitchItem({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  theme,
}: any) {
  return (
    <View style={[styles.item, disabled && styles.disabled]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: theme.border, true: theme.accent }}
      />
    </View>
  );
}

function MenuItem({ icon, title, description, onPress, theme }: any) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={icon} size={20} color={theme.accent} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.itemDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  );
}

function SelectionModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  theme,
}: any) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.backgroundCard }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {options.map((option: { value: string; label: string }) => {
            const active = selected === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  {
                    backgroundColor: active
                      ? theme.accentSoft
                      : theme.backgroundSoft,
                    borderColor: active ? theme.accent : 'transparent',
                  },
                ]}
                onPress={() => onSelect(option.value)}
              >
                <View
                  style={[
                    styles.radio,
                    { borderColor: active ? theme.accent : theme.border },
                  ]}
                >
                  {active && (
                    <View
                      style={[styles.radioDot, { backgroundColor: theme.accent }]}
                    />
                  )}
                </View>
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {option.label}
                </Text>
                {active && (
                  <Ionicons
                    name="checkmark-circle"
                    size={23}
                    color={theme.accent}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 19, textAlign: 'center' },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 3,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: 18,
    marginBottom: 9,
    marginLeft: 4,
  },
  sectionCard: { borderRadius: 22, paddingHorizontal: 15, elevation: 2 },
  item: { minHeight: 72, flexDirection: 'row', alignItems: 'center' },
  disabled: { opacity: 0.45 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: { flex: 1, paddingRight: 10 },
  itemTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 13 },
  itemDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 52 },
  versionCard: {
    minHeight: 76,
    borderRadius: 22,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
  },
  logoCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: { fontFamily: 'Poppins-SemiBold', fontSize: 14 },
  versionText: { fontFamily: 'Poppins-Regular', fontSize: 10, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33,22,77,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 26,
    padding: 22,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: 'Poppins-SemiBold', fontSize: 18 },
  option: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radio: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  radioDot: { width: 9, height: 9, borderRadius: 5 },
  optionText: { flex: 1, fontFamily: 'Poppins-Medium', fontSize: 13 },
});
