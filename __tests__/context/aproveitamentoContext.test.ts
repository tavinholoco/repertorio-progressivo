// Mocks devem vir antes de qualquer import que acione o módulo nativo
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/storage');
jest.mock('@/utils/id', () => ({
  generateId: jest.fn(() => 'test-id'),
  getIsoNow: jest.fn(() => '2025-03-15T10:00:00.000Z'),
}));

import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AproveitamentoProvider, useAproveitamento } from '@/context/AproveitamentoContext';
import * as storage from '@/services/storage';
import type { AproveitamentoRecord, MonthRecord } from '@/types';

const storageModule = storage as jest.Mocked<typeof storage>;

function makeMonths(year = 2025): MonthRecord[] {
  return Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    completedDays: 0,
    totalDays: new Date(year, i + 1, 0).getDate(),
  }));
}

const makeRecord = (overrides: Partial<AproveitamentoRecord> = {}): AproveitamentoRecord => ({
  id: 'test-id',
  eventName: 'Álgebra',
  totalHours: 40,
  periodType: 'mensal',
  monthlyDays: Array.from({ length: 31 }, () => false),
  annualMonths: makeMonths(),
  referencePeriod: '2025-03',
  createdAt: '2025-03-15T10:00:00.000Z',
  updatedAt: '2025-03-15T10:00:00.000Z',
  ...overrides,
});

const makeInput = () => ({
  eventName: 'Álgebra',
  totalHours: 40,
  periodType: 'mensal' as const,
  monthlyDays: Array.from({ length: 31 }, () => false),
  annualMonths: makeMonths(),
  referencePeriod: '2025-03',
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(AproveitamentoProvider, null, children)
);

beforeEach(() => {
  jest.clearAllMocks();
  storageModule.getAproveitamentos.mockResolvedValue([]);
  storageModule.saveAproveitamento.mockResolvedValue(undefined);
  storageModule.deleteAproveitamento.mockResolvedValue(undefined);
});

// ─── Inicialização ────────────────────────────────────────────────────────────

describe('inicialização', () => {
  it('carrega os registros via getAproveitamentos na montagem', async () => {
    const r = makeRecord();
    storageModule.getAproveitamentos.mockResolvedValue([r]);

    const { result } = renderHook(() => useAproveitamento(), { wrapper });

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    expect(result.current.state.records).toEqual([r]);
  });

  it('seta error quando getAproveitamentos lança exceção', async () => {
    storageModule.getAproveitamentos.mockRejectedValue(new Error('Falha de disco'));

    const { result } = renderHook(() => useAproveitamento(), { wrapper });

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    expect(result.current.state.error).toContain('Falha de disco');
  });
});

// ─── addRecord ────────────────────────────────────────────────────────────────

describe('addRecord', () => {
  it('chama saveAproveitamento com id e timestamps gerados', async () => {
    const { result } = renderHook(() => useAproveitamento(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.addRecord(makeInput());
    });

    expect(storageModule.saveAproveitamento).toHaveBeenCalledTimes(1);
    const saved = storageModule.saveAproveitamento.mock.calls[0][0] as AproveitamentoRecord;
    expect(saved.id).toBe('test-id');
    expect(saved.createdAt).toBe('2025-03-15T10:00:00.000Z');
    expect(saved.updatedAt).toBe('2025-03-15T10:00:00.000Z');
  });

  it('adiciona o registro ao state após salvar', async () => {
    const { result } = renderHook(() => useAproveitamento(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.addRecord(makeInput());
    });

    expect(result.current.state.records).toHaveLength(1);
    expect(result.current.state.records[0].eventName).toBe('Álgebra');
  });
});

// ─── updateRecord ─────────────────────────────────────────────────────────────

describe('updateRecord', () => {
  it('chama saveAproveitamento com updatedAt atualizado', async () => {
    const r = makeRecord();
    storageModule.getAproveitamentos.mockResolvedValue([r]);

    const { result } = renderHook(() => useAproveitamento(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateRecord({ ...r, eventName: 'Geometria' });
    });

    const saved = storageModule.saveAproveitamento.mock.calls[0][0] as AproveitamentoRecord;
    expect(saved.eventName).toBe('Geometria');
    expect(saved.updatedAt).toBe('2025-03-15T10:00:00.000Z');
  });

  it('atualiza o registro no state', async () => {
    const r = makeRecord();
    storageModule.getAproveitamentos.mockResolvedValue([r]);

    const { result } = renderHook(() => useAproveitamento(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateRecord({ ...r, totalHours: 80 });
    });

    expect(result.current.state.records[0].totalHours).toBe(80);
  });
});

// ─── removeRecord ─────────────────────────────────────────────────────────────

describe('removeRecord', () => {
  it('chama deleteAproveitamento com o id correto', async () => {
    const r = makeRecord();
    storageModule.getAproveitamentos.mockResolvedValue([r]);

    const { result } = renderHook(() => useAproveitamento(), { wrapper });
    await waitFor(() => expect(result.current.state.isLoading).toBe(false));

    await act(async () => {
      await result.current.removeRecord(r.id);
    });

    expect(storageModule.deleteAproveitamento).toHaveBeenCalledWith(r.id);
  });

  it('remove o registro do state', async () => {
    const r = makeRecord();
    storageModule.getAproveitamentos.mockResolvedValue([r]);

    const { result } = renderHook(() => useAproveitamento(), { wrapper });
    await waitFor(() => expect(result.current.state.records).toHaveLength(1));

    await act(async () => {
      await result.current.removeRecord(r.id);
    });

    expect(result.current.state.records).toHaveLength(0);
  });
});
