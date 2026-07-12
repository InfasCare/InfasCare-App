import { SettingsState } from '@/contexts/SettingsContext';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type InfantCareAlert = {
  title: string;
  body: string;
  critical?: boolean;
  data?: Record<string, unknown>;
};

export async function sendInfantCareAlert(
  alert: InfantCareAlert,
  settings: SettingsState,
) {
  if (!settings.notificationsEnabled) return null;
  if (alert.critical && !settings.criticalAlertsEnabled) return null;

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
  await Notifications.cancelAllScheduledNotificationsAsync();
}
