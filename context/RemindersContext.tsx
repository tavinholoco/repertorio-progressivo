import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import {
  cancelNotification,
  scheduleReminderNotification,
} from '@/services/notifications';
import {
  deleteReminder,
  getReminders,
  saveReminder,
} from '@/services/storage';
import type { Priority, Reminder } from '@/types';
import { generateId, getIsoNow } from '@/utils/id';

// ─── State & Actions ──────────────────────────────────────────────────────────

interface State {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Reminder[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'ADD'; payload: Reminder }
  | { type: 'UPDATE'; payload: Reminder }
  | { type: 'DELETE'; payload: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { reminders: action.payload, isLoading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload.id ? action.payload : r,
        ),
      };
    case 'DELETE':
      return {
        ...state,
        reminders: state.reminders.filter((r) => r.id !== action.payload),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ReminderInput {
  name: string;
  date: string;
  time: string;
  priority: Priority;
  customColor?: string;
}

interface ContextValue {
  state: State;
  addReminder: (input: ReminderInput) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
}

const RemindersContext = createContext<ContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    reminders: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    dispatch({ type: 'LOAD_START' });
    getReminders()
      .then((data) => dispatch({ type: 'LOAD_SUCCESS', payload: data }))
      .catch((err) =>
        dispatch({ type: 'LOAD_ERROR', payload: String(err) }),
      );
  }, []);

  async function addReminder(input: ReminderInput): Promise<void> {
    const reminder: Reminder = {
      ...input,
      id: generateId(),
      createdAt: getIsoNow(),
    };

    await saveReminder(reminder);

    const notificationId = await scheduleReminderNotification(reminder);
    const saved: Reminder = notificationId
      ? { ...reminder, notificationId }
      : reminder;

    if (notificationId) await saveReminder(saved);
    dispatch({ type: 'ADD', payload: saved });
  }

  async function updateReminder(reminder: Reminder): Promise<void> {
    if (reminder.notificationId) {
      await cancelNotification(reminder.notificationId);
    }

    const notificationId = await scheduleReminderNotification(reminder);
    const updated: Reminder = {
      ...reminder,
      notificationId: notificationId ?? undefined,
      updatedAt: getIsoNow(),
    };

    await saveReminder(updated);
    dispatch({ type: 'UPDATE', payload: updated });
  }

  async function removeReminder(id: string): Promise<void> {
    const target = state.reminders.find((r) => r.id === id);
    if (target?.notificationId) {
      await cancelNotification(target.notificationId);
    }

    await deleteReminder(id);
    dispatch({ type: 'DELETE', payload: id });
  }

  return (
    <RemindersContext.Provider
      value={{ state, addReminder, updateReminder, removeReminder }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReminders(): ContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders deve ser usado dentro de RemindersProvider');
  return ctx;
}
