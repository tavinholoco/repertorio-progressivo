// Mocks devem vir antes de qualquer import que acione o módulo nativo
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/storage', () => ({
  getReminders: jest.fn(),
  saveReminder: jest.fn(),
  deleteReminder: jest.fn(),
}));

import { reducer } from '@/context/RemindersContext';
import type { Reminder } from '@/types';

const makeReminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  id: '1',
  name: 'Reunião',
  date: '2025-03-10',
  time: '09:00',
  priority: 'green',
  createdAt: new Date().toISOString(),
  ...overrides,
});

const initialState = {
  reminders: [],
  isLoading: false,
  error: null,
};

describe('remindersReducer', () => {
  describe('LOAD_START', () => {
    it('seta isLoading para true e limpa o erro', () => {
      const state = { ...initialState, error: 'erro anterior' };
      const next = reducer(state, { type: 'LOAD_START' });
      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('preserva os lembretes existentes', () => {
      const r = makeReminder();
      const state = { ...initialState, reminders: [r] };
      const next = reducer(state, { type: 'LOAD_START' });
      expect(next.reminders).toEqual([r]);
    });
  });

  describe('LOAD_SUCCESS', () => {
    it('substitui os lembretes pelo payload', () => {
      const r1 = makeReminder({ id: '1' });
      const r2 = makeReminder({ id: '2' });
      const next = reducer(
        { ...initialState, isLoading: true },
        { type: 'LOAD_SUCCESS', payload: [r1, r2] },
      );
      expect(next.reminders).toEqual([r1, r2]);
    });

    it('seta isLoading para false e limpa o erro', () => {
      const next = reducer(
        { ...initialState, isLoading: true, error: 'algo' },
        { type: 'LOAD_SUCCESS', payload: [] },
      );
      expect(next.isLoading).toBe(false);
      expect(next.error).toBeNull();
    });
  });

  describe('LOAD_ERROR', () => {
    it('salva a mensagem de erro e seta isLoading para false', () => {
      const next = reducer(
        { ...initialState, isLoading: true },
        { type: 'LOAD_ERROR', payload: 'Falha na leitura' },
      );
      expect(next.isLoading).toBe(false);
      expect(next.error).toBe('Falha na leitura');
    });

    it('preserva os lembretes existentes', () => {
      const r = makeReminder();
      const next = reducer(
        { ...initialState, reminders: [r] },
        { type: 'LOAD_ERROR', payload: 'erro' },
      );
      expect(next.reminders).toEqual([r]);
    });
  });

  describe('ADD', () => {
    it('adiciona um lembrete à lista', () => {
      const r = makeReminder();
      const next = reducer(initialState, { type: 'ADD', payload: r });
      expect(next.reminders).toHaveLength(1);
      expect(next.reminders[0]).toEqual(r);
    });

    it('adiciona múltiplos lembretes acumulativamente', () => {
      const r1 = makeReminder({ id: '1' });
      const r2 = makeReminder({ id: '2' });
      let state = reducer(initialState, { type: 'ADD', payload: r1 });
      state = reducer(state, { type: 'ADD', payload: r2 });
      expect(state.reminders).toHaveLength(2);
    });

    it('não altera isLoading nem error', () => {
      const next = reducer(initialState, { type: 'ADD', payload: makeReminder() });
      expect(next.isLoading).toBe(false);
      expect(next.error).toBeNull();
    });
  });

  describe('UPDATE', () => {
    it('substitui o lembrete pelo id correspondente', () => {
      const original = makeReminder({ name: 'Original' });
      const state = { ...initialState, reminders: [original] };
      const updated = makeReminder({ name: 'Atualizado' });
      const next = reducer(state, { type: 'UPDATE', payload: updated });
      expect(next.reminders[0].name).toBe('Atualizado');
    });

    it('não altera outros lembretes', () => {
      const r1 = makeReminder({ id: '1', name: 'A' });
      const r2 = makeReminder({ id: '2', name: 'B' });
      const state = { ...initialState, reminders: [r1, r2] };
      const updatedR1 = makeReminder({ id: '1', name: 'A atualizado' });
      const next = reducer(state, { type: 'UPDATE', payload: updatedR1 });
      expect(next.reminders).toHaveLength(2);
      expect(next.reminders[1].name).toBe('B');
    });

    it('não altera a lista se o id não for encontrado', () => {
      const r = makeReminder({ id: '1' });
      const state = { ...initialState, reminders: [r] };
      const ghost = makeReminder({ id: '999', name: 'Fantasma' });
      const next = reducer(state, { type: 'UPDATE', payload: ghost });
      expect(next.reminders).toHaveLength(1);
      expect(next.reminders[0].id).toBe('1');
    });
  });

  describe('DELETE', () => {
    it('remove o lembrete pelo id', () => {
      const r1 = makeReminder({ id: '1' });
      const r2 = makeReminder({ id: '2' });
      const state = { ...initialState, reminders: [r1, r2] };
      const next = reducer(state, { type: 'DELETE', payload: '1' });
      expect(next.reminders).toHaveLength(1);
      expect(next.reminders[0].id).toBe('2');
    });

    it('não falha ao tentar deletar id inexistente', () => {
      const r = makeReminder({ id: '1' });
      const state = { ...initialState, reminders: [r] };
      const next = reducer(state, { type: 'DELETE', payload: '999' });
      expect(next.reminders).toHaveLength(1);
    });

    it('resulta em lista vazia quando o único lembrete é removido', () => {
      const r = makeReminder();
      const state = { ...initialState, reminders: [r] };
      const next = reducer(state, { type: 'DELETE', payload: r.id });
      expect(next.reminders).toHaveLength(0);
    });
  });
});
