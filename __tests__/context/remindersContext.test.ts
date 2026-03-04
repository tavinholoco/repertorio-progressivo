// Mocks devem vir antes de qualquer import que acione o módulo nativo
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/storage');
jest.mock('@/services/notifications');
jest.mock('@/utils/id', () => ({
  generateId: jest.fn(() => 'test-id'),
  getIsoNow: jest.fn(() => '2025-03-15T10:00:00.000Z'),
}));

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { RemindersProvider, useReminders } from '@/context/RemindersContext';
import * as storage from '@/services/storage';
import * as notifications from '@/services/notifications';
import type { Reminder } from '@/types';

const storageModule = storage as jest.Mocked<typeof storage>;
const notificationsModule = notifications as jest.Mocked<typeof notifications>;

const makeInput = (overrides: Partial<Reminder> = {}) => ({
  name: 'Reunião',
  date: '2025-03-10',
  time: '09:00',
  priority: 'green' as const,
  ...overrides,
});

const makeReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: 'test-id',
  name: 'Reunião',
  date: '2025-03-10',
  time: '09:00',
  priority: 'green',
  createdAt: '2025-03-15T10:00:00.000Z',
  ...overrides,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(RemindersProvider, null, children)
);

beforeEach(() => {
  jest.clearAllMocks();
  storageModule.getReminders.mockResolvedValue([]);
  storageModule.saveReminder.mockResolvedValue(undefined);
  storageModule.deleteReminder.mockResolvedValue(undefined);
  notificationsModule.scheduleReminderNotification.mockResolvedValue(null);
  notificationsModule.cancelNotification.mockResolvedValue(undefined);
});

// ─── Inicialização ────────────────────────────────────────────────────────────

describe('inicialização', () => {
  it('carrega os lembretes via getReminders na montagem', async () => {
    const r = makeReminder();
    storageModule.getReminders.mockResolvedValue([r]);

    const { result } = renderHook(() => useReminders(), { wrapper });

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    expect(result.current.state.reminders).toEqual([r]);
  });

  it('seta error quando getReminders lança exceção', async () => {
    storageModule.getReminders.mockRejectedValue(new Error('Falha de disco'));

    const { result } = renderHook(() => useReminders(), { wrapper });

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    expect(result.current.state.error).toContain('Falha de disco');
  });
});

// ─── addReminder ──────────────────────────────────────────────────────────────

describe('addReminder', () => {
  it('chama saveReminder antes de scheduleReminderNotification', async () => {
    let callCount = 0;
    let saveCallOrder = 0;
    let scheduleCallOrder = 0;

    storageModule.saveReminder.mockImplementation(async () => {
      saveCallOrder = ++callCount;
    });
    notificationsModule.scheduleReminderNotification.mockImplementation(async () => {
      scheduleCallOrder = ++callCount;
      return null;
    });

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.addReminder(makeInput());
    });

    expect(saveCallOrder).toBeLessThan(scheduleCallOrder);
  });

  it('salva novamente com notificationId quando scheduleReminderNotification retorna id', async () => {
    notificationsModule.scheduleReminderNotification.mockResolvedValue('notif-123');

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.addReminder(makeInput());
    });

    expect(storageModule.saveReminder).toHaveBeenCalledTimes(2);
    const secondCall = storageModule.saveReminder.mock.calls[1][0] as Reminder;
    expect(secondCall.notificationId).toBe('notif-123');
  });

  it('não faz segunda save quando scheduleReminderNotification retorna null', async () => {
    notificationsModule.scheduleReminderNotification.mockResolvedValue(null);

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.addReminder(makeInput());
    });

    expect(storageModule.saveReminder).toHaveBeenCalledTimes(1);
  });

  it('adiciona o reminder ao state após salvar', async () => {
    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.addReminder(makeInput());
    });

    expect(result.current.state.reminders).toHaveLength(1);
    expect(result.current.state.reminders[0].name).toBe('Reunião');
  });
});

// ─── updateReminder ───────────────────────────────────────────────────────────

describe('updateReminder', () => {
  it('cancela notificação antiga quando reminder tem notificationId', async () => {
    const r = makeReminder({ notificationId: 'old-notif' });
    storageModule.getReminders.mockResolvedValue([r]);

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateReminder(r);
    });

    expect(notificationsModule.cancelNotification).toHaveBeenCalledWith('old-notif');
  });

  it('não chama cancelNotification quando reminder não tem notificationId', async () => {
    const r = makeReminder();
    storageModule.getReminders.mockResolvedValue([r]);

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateReminder(r);
    });

    expect(notificationsModule.cancelNotification).not.toHaveBeenCalled();
  });

  it('agenda nova notificação e salva com updatedAt', async () => {
    notificationsModule.scheduleReminderNotification.mockResolvedValue('new-notif');
    const r = makeReminder();
    storageModule.getReminders.mockResolvedValue([r]);

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateReminder(r);
    });

    const savedArg = storageModule.saveReminder.mock.calls[0][0] as Reminder;
    expect(savedArg.notificationId).toBe('new-notif');
    expect(savedArg.updatedAt).toBe('2025-03-15T10:00:00.000Z');
  });
});

// ─── removeReminder ───────────────────────────────────────────────────────────

describe('removeReminder', () => {
  it('cancela notificação quando reminder tem notificationId', async () => {
    const r = makeReminder({ notificationId: 'notif-to-cancel' });
    storageModule.getReminders.mockResolvedValue([r]);

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.removeReminder(r.id);
    });

    expect(notificationsModule.cancelNotification).toHaveBeenCalledWith('notif-to-cancel');
  });

  it('não chama cancelNotification quando reminder não tem notificationId', async () => {
    const r = makeReminder();
    storageModule.getReminders.mockResolvedValue([r]);

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.removeReminder(r.id);
    });

    expect(notificationsModule.cancelNotification).not.toHaveBeenCalled();
  });

  it('remove o reminder do state', async () => {
    const r = makeReminder();
    storageModule.getReminders.mockResolvedValue([r]);

    const { result } = renderHook(() => useReminders(), { wrapper });
    await waitFor(() => expect(result.current.state.reminders).toHaveLength(1));

    await act(async () => {
      await result.current.removeReminder(r.id);
    });

    expect(result.current.state.reminders).toHaveLength(0);
    expect(storageModule.deleteReminder).toHaveBeenCalledWith(r.id);
  });
});
