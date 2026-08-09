import { SettingsState } from '@/contexts/SettingsContext';
import Constants from 'expo-constants';

type InfantCareAlert = {
  title: string;
  body: string;
  critical?: boolean;
  data?: Record<string, unknown>;
};

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

export async function sendInfantCareAlert(
  alert: InfantCareAlert,
  settings: SettingsState,
) {
  if (!settings.notificationsEnabled) {
    return null;
  }

  if (alert.critical && !settings.criticalAlertsEnabled) {
    return null;
  }

  if (isExpoGo()) {
    console.warn(
      'Notificações não estão disponíveis no Expo Go. Use uma development build.',
    );

    return null;
  }

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: settings.soundsEnabled,
      shouldSetBadge: false,
    }),
  });

  return Notifications.scheduleNotificationAsync({
    content: {
      title: alert.title,
      body: alert.body,
      data: alert.data,
      sound: settings.soundsEnabled ? 'default' : undefined,
      priority: alert.critical
        ? Notifications.AndroidNotificationPriority.MAX
        : Notifications.AndroidNotificationPriority.DEFAULT,
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: alert.critical
        ? 'infantcare-critical'
        : 'infantcare-default',
    },
  });
}

export async function cancelAllInfantCareNotifications() {
  if (isExpoGo()) {
    return;
  }

  const Notifications = await import('expo-notifications');

  await Notifications.cancelAllScheduledNotificationsAsync();
}