import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  deleteAproveitamento,
  deleteReminder,
  getAproveitamentos,
  getReminders,
  saveAproveitamento,
  saveReminder,
} from '@/services/storage';
import type { AproveitamentoRecord, MonthRecord, Reminder } from '@/types';

// Mock automático do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const makeReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: '1',
  name: 'Teste',
  date: '2025-03-10',
  time: '09:00',
  priority: 'green',
  createdAt: new Date().toISOString(),
  ...overrides,
});

/** Gera os 12 MonthRecord de um ano com os dias reais de cada mês. */
function makeAnnualMonths(year: number): MonthRecord[] {
  return Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    completedDays: 0,
    totalDays: new Date(year, i + 1, 0).getDate(),
  }));
}

const makeRecord = (overrides: Partial<AproveitamentoRecord> = {}): AproveitamentoRecord => ({
  id: '1',
  eventName: 'Álgebra',
  totalHours: 40,
  periodType: 'mensal',
  monthlyDays: Array.from({ length: 31 }, () => false), // Março tem 31 dias
  annualMonths: makeAnnualMonths(2025),
  referencePeriod: '2025-03',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Limpa o mock entre os testes
beforeEach(() => {
  AsyncStorage.clear();
});

// ─── Reminders ────────────────────────────────────────────────────────────────

describe('Reminders', () => {
  it('retorna [] quando storage está vazio', async () => {
    const result = await getReminders();
    expect(result).toEqual([]);
  });

  it('retorna [] quando storage contém JSON inválido', async () => {
    await AsyncStorage.setItem('@app:reminders', 'dados corrompidos');
    const result = await getReminders();
    expect(result).toEqual([]);
  });

  it('salva e recupera um lembrete', async () => {
    const reminder = makeReminder();
    await saveReminder(reminder);

    const result = await getReminders();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(reminder);
  });

  it('faz upsert quando id já existe', async () => {
    const original = makeReminder({ name: 'Original' });
    await saveReminder(original);

    const updated = makeReminder({ name: 'Atualizado' });
    await saveReminder(updated);

    const result = await getReminders();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Atualizado');
  });

  it('salva múltiplos lembretes sem duplicar', async () => {
    await saveReminder(makeReminder({ id: '1' }));
    await saveReminder(makeReminder({ id: '2' }));

    const result = await getReminders();
    expect(result).toHaveLength(2);
  });

  it('deleta o lembrete correto', async () => {
    await saveReminder(makeReminder({ id: '1', name: 'A' }));
    await saveReminder(makeReminder({ id: '2', name: 'B' }));
    await deleteReminder('1');

    const result = await getReminders();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('não falha ao deletar id inexistente', async () => {
    await saveReminder(makeReminder({ id: '1' }));
    await deleteReminder('999');

    const result = await getReminders();
    expect(result).toHaveLength(1);
  });
});

// ─── Aproveitamento ───────────────────────────────────────────────────────────

describe('Aproveitamento', () => {
  it('retorna [] quando storage está vazio', async () => {
    const result = await getAproveitamentos();
    expect(result).toEqual([]);
  });

  it('retorna [] quando storage contém JSON inválido', async () => {
    await AsyncStorage.setItem('@app:aproveitamento', '{json quebrado');
    const result = await getAproveitamentos();
    expect(result).toEqual([]);
  });

  it('salva e recupera um registro', async () => {
    const record = makeRecord();
    await saveAproveitamento(record);

    const result = await getAproveitamentos();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(record);
  });

  it('faz upsert quando id já existe', async () => {
    await saveAproveitamento(makeRecord({ totalHours: 5 }));
    await saveAproveitamento(makeRecord({ totalHours: 20 }));

    const result = await getAproveitamentos();
    expect(result).toHaveLength(1);
    expect(result[0].totalHours).toBe(20);
  });

  it('deleta o registro correto', async () => {
    await saveAproveitamento(makeRecord({ id: '1' }));
    await saveAproveitamento(makeRecord({ id: '2' }));
    await deleteAproveitamento('1');

    const result = await getAproveitamentos();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('preserva os 12 meses no annualMonths após salvar e recuperar', async () => {
    const record = makeRecord();
    await saveAproveitamento(record);

    const result = await getAproveitamentos();
    expect(result[0].annualMonths).toHaveLength(12);
    expect(result[0].annualMonths[0].monthIndex).toBe(0);
    expect(result[0].annualMonths[11].monthIndex).toBe(11);
  });
});
