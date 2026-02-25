// Mocks devem vir antes de qualquer import que acione o módulo nativo
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/storage', () => ({
  getAproveitamentos: jest.fn(),
  saveAproveitamento: jest.fn(),
  deleteAproveitamento: jest.fn(),
}));

import { reducer } from '@/context/AproveitamentoContext';
import type { AproveitamentoRecord, MonthRecord } from '@/types';

function makeMonths(year = 2025): MonthRecord[] {
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
  completedHours: 10,
  periodType: 'mensal',
  monthlyDays: Array.from({ length: 31 }, () => false),
  annualMonths: makeMonths(),
  referencePeriod: '2025-03',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const initialState = {
  records: [],
  isLoading: false,
  error: null,
};

describe('aproveitamentoReducer', () => {
  describe('LOAD_START', () => {
    it('seta isLoading para true e limpa o erro', () => {
      const state = { ...initialState, error: 'erro anterior' };
      const next = reducer(state, { type: 'LOAD_START' });
      expect(next.isLoading).toBe(true);
      expect(next.error).toBeNull();
    });

    it('preserva os registros existentes', () => {
      const r = makeRecord();
      const state = { ...initialState, records: [r] };
      const next = reducer(state, { type: 'LOAD_START' });
      expect(next.records).toEqual([r]);
    });
  });

  describe('LOAD_SUCCESS', () => {
    it('substitui os registros pelo payload', () => {
      const r1 = makeRecord({ id: '1' });
      const r2 = makeRecord({ id: '2' });
      const next = reducer(
        { ...initialState, isLoading: true },
        { type: 'LOAD_SUCCESS', payload: [r1, r2] },
      );
      expect(next.records).toEqual([r1, r2]);
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

    it('preserva os registros existentes', () => {
      const r = makeRecord();
      const next = reducer(
        { ...initialState, records: [r] },
        { type: 'LOAD_ERROR', payload: 'erro' },
      );
      expect(next.records).toEqual([r]);
    });
  });

  describe('ADD', () => {
    it('adiciona um registro à lista', () => {
      const r = makeRecord();
      const next = reducer(initialState, { type: 'ADD', payload: r });
      expect(next.records).toHaveLength(1);
      expect(next.records[0]).toEqual(r);
    });

    it('adiciona múltiplos registros acumulativamente', () => {
      const r1 = makeRecord({ id: '1' });
      const r2 = makeRecord({ id: '2' });
      let state = reducer(initialState, { type: 'ADD', payload: r1 });
      state = reducer(state, { type: 'ADD', payload: r2 });
      expect(state.records).toHaveLength(2);
    });

    it('não altera isLoading nem error', () => {
      const next = reducer(initialState, { type: 'ADD', payload: makeRecord() });
      expect(next.isLoading).toBe(false);
      expect(next.error).toBeNull();
    });

    it('preserva os annualMonths do registro adicionado', () => {
      const r = makeRecord();
      const next = reducer(initialState, { type: 'ADD', payload: r });
      expect(next.records[0].annualMonths).toHaveLength(12);
    });
  });

  describe('UPDATE', () => {
    it('substitui o registro pelo id correspondente', () => {
      const original = makeRecord({ eventName: 'Original' });
      const state = { ...initialState, records: [original] };
      const updated = makeRecord({ eventName: 'Atualizado' });
      const next = reducer(state, { type: 'UPDATE', payload: updated });
      expect(next.records[0].eventName).toBe('Atualizado');
    });

    it('não altera outros registros', () => {
      const r1 = makeRecord({ id: '1', eventName: 'A' });
      const r2 = makeRecord({ id: '2', eventName: 'B' });
      const state = { ...initialState, records: [r1, r2] };
      const updatedR1 = makeRecord({ id: '1', eventName: 'A atualizado' });
      const next = reducer(state, { type: 'UPDATE', payload: updatedR1 });
      expect(next.records).toHaveLength(2);
      expect(next.records[1].eventName).toBe('B');
    });

    it('não altera a lista se o id não for encontrado', () => {
      const r = makeRecord({ id: '1' });
      const state = { ...initialState, records: [r] };
      const ghost = makeRecord({ id: '999', eventName: 'Fantasma' });
      const next = reducer(state, { type: 'UPDATE', payload: ghost });
      expect(next.records).toHaveLength(1);
      expect(next.records[0].id).toBe('1');
    });

    it('atualiza completedHours corretamente', () => {
      const original = makeRecord({ completedHours: 5 });
      const state = { ...initialState, records: [original] };
      const updated = makeRecord({ completedHours: 20 });
      const next = reducer(state, { type: 'UPDATE', payload: updated });
      expect(next.records[0].completedHours).toBe(20);
    });
  });

  describe('DELETE', () => {
    it('remove o registro pelo id', () => {
      const r1 = makeRecord({ id: '1' });
      const r2 = makeRecord({ id: '2' });
      const state = { ...initialState, records: [r1, r2] };
      const next = reducer(state, { type: 'DELETE', payload: '1' });
      expect(next.records).toHaveLength(1);
      expect(next.records[0].id).toBe('2');
    });

    it('não falha ao tentar deletar id inexistente', () => {
      const r = makeRecord({ id: '1' });
      const state = { ...initialState, records: [r] };
      const next = reducer(state, { type: 'DELETE', payload: '999' });
      expect(next.records).toHaveLength(1);
    });

    it('resulta em lista vazia quando o único registro é removido', () => {
      const r = makeRecord();
      const state = { ...initialState, records: [r] };
      const next = reducer(state, { type: 'DELETE', payload: r.id });
      expect(next.records).toHaveLength(0);
    });
  });
});
