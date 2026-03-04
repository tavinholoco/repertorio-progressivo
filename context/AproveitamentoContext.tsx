import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import {
  deleteAproveitamento,
  getAproveitamentos,
  saveAproveitamento,
} from '@/services/storage';
import type { AproveitamentoRecord } from '@/types';
import { generateId, getIsoNow } from '@/utils/id';

// ─── State & Actions ──────────────────────────────────────────────────────────

interface State {
  records: AproveitamentoRecord[];
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: AproveitamentoRecord[] }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'ADD'; payload: AproveitamentoRecord }
  | { type: 'UPDATE'; payload: AproveitamentoRecord }
  | { type: 'DELETE'; payload: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { records: action.payload, isLoading: false, error: null };
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD':
      return { ...state, records: [...state.records, action.payload] };
    case 'UPDATE':
      return {
        ...state,
        records: state.records.map((r) =>
          r.id === action.payload.id ? action.payload : r,
        ),
      };
    case 'DELETE':
      return {
        ...state,
        records: state.records.filter((r) => r.id !== action.payload),
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ContextValue {
  state: State;
  addRecord: (record: Omit<AproveitamentoRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (record: AproveitamentoRecord) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
}

const AproveitamentoContext = createContext<ContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AproveitamentoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    records: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    dispatch({ type: 'LOAD_START' });
    getAproveitamentos()
      .then((data) => dispatch({ type: 'LOAD_SUCCESS', payload: data }))
      .catch((err) =>
        dispatch({ type: 'LOAD_ERROR', payload: String(err) }),
      );
  }, []);

  async function addRecord(
    input: Omit<AproveitamentoRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const now = getIsoNow();
    const record: AproveitamentoRecord = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    await saveAproveitamento(record);
    dispatch({ type: 'ADD', payload: record });
  }

  async function updateRecord(record: AproveitamentoRecord): Promise<void> {
    const updated: AproveitamentoRecord = {
      ...record,
      updatedAt: getIsoNow(),
    };

    await saveAproveitamento(updated);
    dispatch({ type: 'UPDATE', payload: updated });
  }

  async function removeRecord(id: string): Promise<void> {
    await deleteAproveitamento(id);
    dispatch({ type: 'DELETE', payload: id });
  }

  return (
    <AproveitamentoContext.Provider
      value={{ state, addRecord, updateRecord, removeRecord }}
    >
      {children}
    </AproveitamentoContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAproveitamento(): ContextValue {
  const ctx = useContext(AproveitamentoContext);
  if (!ctx)
    throw new Error(
      'useAproveitamento deve ser usado dentro de AproveitamentoProvider',
    );
  return ctx;
}
