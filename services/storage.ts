/**
 * Camada de acesso ao AsyncStorage.
 * Nenhum componente ou context chama AsyncStorage diretamente — tudo passa aqui.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AproveitamentoRecord, Reminder } from '@/types';

const KEYS = {
  REMINDERS: '@app:reminders',
  APROVEITAMENTO: '@app:aproveitamento',
} as const;

// ─── Lembretes ────────────────────────────────────────────────────────────────

export async function getReminders(): Promise<Reminder[]> {
  const raw = await AsyncStorage.getItem(KEYS.REMINDERS);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Reminder[];
  } catch (err) {
    console.error('[storage] Dados de lembretes corrompidos, descartando:', err);
    return [];
  }
}

/** Cria ou atualiza (upsert por id). */
export async function saveReminder(reminder: Reminder): Promise<void> {
  const list = await getReminders();
  const idx = list.findIndex((r) => r.id === reminder.id);

  if (idx >= 0) {
    list[idx] = reminder;
  } else {
    list.push(reminder);
  }

  await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(list));
}

export async function deleteReminder(id: string): Promise<void> {
  const list = await getReminders();
  const filtered = list.filter((r) => r.id !== id);
  await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(filtered));
}

// ─── Aproveitamento ──────────────────────────────────────────────────────────

export async function getAproveitamentos(): Promise<AproveitamentoRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.APROVEITAMENTO);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AproveitamentoRecord[];
  } catch (err) {
    console.error('[storage] Dados de aproveitamento corrompidos, descartando:', err);
    return [];
  }
}

/** Cria ou atualiza (upsert por id). */
export async function saveAproveitamento(
  record: AproveitamentoRecord,
): Promise<void> {
  const list = await getAproveitamentos();
  const idx = list.findIndex((r) => r.id === record.id);

  if (idx >= 0) {
    list[idx] = record;
  } else {
    list.push(record);
  }

  await AsyncStorage.setItem(KEYS.APROVEITAMENTO, JSON.stringify(list));
}

export async function deleteAproveitamento(id: string): Promise<void> {
  const list = await getAproveitamentos();
  const filtered = list.filter((r) => r.id !== id);
  await AsyncStorage.setItem(KEYS.APROVEITAMENTO, JSON.stringify(filtered));
}
