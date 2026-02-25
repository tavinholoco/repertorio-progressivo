import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  cancelNotification,
  requestPermissions,
  scheduleReminderNotification,
} from '@/services/notifications';
import type { Reminder } from '@/types';

// ─── Mock expo-notifications ──────────────────────────────────────────────────

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.Mock;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Data futura garantida (amanhã ao meio-dia). */
function futureDateReminder(overrides: Partial<Reminder> = {}): Reminder {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  return {
    id: '1',
    name: 'Lembrete Futuro',
    date: `${yyyy}-${mm}-${dd}`,
    time: '12:00',
    priority: 'green',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** Data passada garantida. */
function pastDateReminder(): Reminder {
  return {
    id: '2',
    name: 'Lembrete Passado',
    date: '2000-01-01',
    time: '09:00',
    priority: 'green',
    createdAt: new Date().toISOString(),
  };
}

// ─── Limpa mocks entre testes ─────────────────────────────────────────────────

// Platform.OS é uma propriedade simples no ambiente Jest do React Native;
// usar atribuição direta (não spyOn com 'get').
const originalOS = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
  (Platform as unknown as { OS: string }).OS = 'android';
});

afterAll(() => {
  (Platform as unknown as { OS: string }).OS = originalOS;
});

// ─── requestPermissions ───────────────────────────────────────────────────────

describe('requestPermissions', () => {
  it('retorna false na web', async () => {
    (Platform as unknown as { OS: string }).OS = 'web';
    const result = await requestPermissions();
    expect(result).toBe(false);
  });

  it('retorna true se permissão já concedida', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
    const result = await requestPermissions();
    expect(result).toBe(true);
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  it('solicita permissão se não concedida e retorna true quando aceita', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    const result = await requestPermissions();
    expect(result).toBe(true);
  });

  it('retorna false quando usuário nega a permissão', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    const result = await requestPermissions();
    expect(result).toBe(false);
  });
});

// ─── scheduleReminderNotification ────────────────────────────────────────────

describe('scheduleReminderNotification', () => {
  beforeEach(() => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
  });

  it('retorna null quando permissão negada', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    const result = await scheduleReminderNotification(futureDateReminder());
    expect(result).toBeNull();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('retorna null para data no passado', async () => {
    const result = await scheduleReminderNotification(pastDateReminder());
    expect(result).toBeNull();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('retorna null para data inválida', async () => {
    const reminder = futureDateReminder({ date: 'invalido', time: 'xx:yy' });
    const result = await scheduleReminderNotification(reminder);
    expect(result).toBeNull();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('retorna o id ao agendar com sucesso', async () => {
    mockSchedule.mockResolvedValue('notif-abc-123');
    const result = await scheduleReminderNotification(futureDateReminder());
    expect(result).toBe('notif-abc-123');
    expect(mockSchedule).toHaveBeenCalledTimes(1);
  });

  it('passa o nome do lembrete como body da notificação', async () => {
    mockSchedule.mockResolvedValue('id-qualquer');
    const reminder = futureDateReminder({ name: 'Estudar Álgebra' });
    await scheduleReminderNotification(reminder);
    const callArg = mockSchedule.mock.calls[0][0];
    expect(callArg.content.body).toBe('Estudar Álgebra');
  });

  it('retorna null se scheduleNotificationAsync lançar erro', async () => {
    mockSchedule.mockRejectedValue(new Error('Falha do OS'));
    const result = await scheduleReminderNotification(futureDateReminder());
    expect(result).toBeNull();
  });
});

// ─── cancelNotification ───────────────────────────────────────────────────────

describe('cancelNotification', () => {
  it('chama cancelScheduledNotificationAsync com o id correto', async () => {
    mockCancel.mockResolvedValue(undefined);
    await cancelNotification('notif-xyz');
    expect(mockCancel).toHaveBeenCalledWith('notif-xyz');
  });
});
