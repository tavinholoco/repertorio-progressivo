/**
 * Wrapper sobre expo-notifications.
 * Centraliza o agendamento e cancelamento de notificações de lembretes.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '@/types';

// Configura como as notificações aparecem com o app em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Solicita permissão ao usuário. Retorna true se concedida. */
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Agenda uma notificação para o horário do lembrete.
 * Retorna o notificationId, ou null se a permissão foi negada ou a data já passou.
 */
export async function scheduleReminderNotification(
  reminder: Reminder,
): Promise<string | null> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) return null;

  const [year, month, day] = reminder.date.split('-').map(Number);
  const [hour, minute] = reminder.time.split(':').map(Number);
  const triggerDate = new Date(year, month - 1, day, hour, minute, 0);

  if (isNaN(triggerDate.getTime()) || triggerDate <= new Date()) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Lembrete',
        body: reminder.name,
        data: { reminderId: reminder.id },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
    return id;
  } catch (err) {
    console.error('[notifications] Falha ao agendar notificação:', err);
    return null;
  }
}

/** Cancela uma notificação agendada pelo seu ID. */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
