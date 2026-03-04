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

type StorageKey = (typeof KEYS)[keyof typeof KEYS];

// ─── Helpers internos ────────────────────────────────────────────────────────

async function readList<T>(key: StorageKey): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch (err) {
    console.error(`[storage] Dados corrompidos em "${key}", descartando:`, err);
    return [];
  }
}

async function upsert<T extends { id: string }>(key: StorageKey, item: T): Promise<void> {
  const list = await readList<T>(key);
  const idx = list.findIndex((r) => r.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push(item);
  }
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

// ─── Lembretes ────────────────────────────────────────────────────────────────

export async function getReminders(): Promise<Reminder[]> {
  return readList<Reminder>(KEYS.REMINDERS);
}

/** Cria ou atualiza (upsert por id). */
export async function saveReminder(reminder: Reminder): Promise<void> {
  return upsert(KEYS.REMINDERS, reminder);
}

export async function deleteReminder(id: string): Promise<void> {
  const list = await getReminders();
  const filtered = list.filter((r) => r.id !== id);
  await AsyncStorage.setItem(KEYS.REMINDERS, JSON.stringify(filtered));
}

// ─── Aproveitamento ──────────────────────────────────────────────────────────

export async function getAproveitamentos(): Promise<AproveitamentoRecord[]> {
  return readList<AproveitamentoRecord>(KEYS.APROVEITAMENTO);
}

/** Cria ou atualiza (upsert por id). */
export async function saveAproveitamento(record: AproveitamentoRecord): Promise<void> {
  return upsert(KEYS.APROVEITAMENTO, record);
}

export async function deleteAproveitamento(id: string): Promise<void> {
  const list = await getAproveitamentos();
  const filtered = list.filter((r) => r.id !== id);
  await AsyncStorage.setItem(KEYS.APROVEITAMENTO, JSON.stringify(filtered));
}
