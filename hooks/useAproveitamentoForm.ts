import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useAproveitamento } from '@/context/AproveitamentoContext';
import type { AproveitamentoRecord, MonthRecord, PeriodType } from '@/types';
import { validateAproveitamento } from '@/utils/validation';
import {
  getDaysInMonth,
  buildAnnualMonths,
  currentPeriod,
} from '@/utils/dateHelpers';

export function useAproveitamentoForm() {
  const { state, addRecord, updateRecord, removeRecord } = useAproveitamento();

  // Formulário
  const [evento, setEvento] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [tempo, setTempo] = useState<PeriodType>('mensal');
  const [referencePeriod, setReferencePeriod] = useState(currentPeriod);

  // Estado de dias/meses (hidratado ao mudar período)
  const daysInMonth = useMemo(() => getDaysInMonth(referencePeriod), [referencePeriod]);
  const [dias, setDias] = useState<boolean[]>(() =>
    Array.from({ length: daysInMonth }, () => false),
  );
  const [annualMonths, setAnnualMonths] = useState<MonthRecord[]>(() =>
    buildAnnualMonths(new Date().getFullYear()),
  );

  // Edição e submissão
  const skipNextHydrationRef = useRef(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Hidratar formulário ao mudar período ──────────────────────────────────
  useEffect(() => {
    const existing = state.records.find(
      (r) => r.referencePeriod === referencePeriod && r.periodType === tempo,
    );

    if (existing) {
      if (skipNextHydrationRef.current) {
        // Acabou de salvar novo registro — limpar formulário
        skipNextHydrationRef.current = false;
        const [y] = referencePeriod.split('-').map(Number);
        setEvento('');
        setCargaHoraria('');
        setDias(Array.from({ length: getDaysInMonth(referencePeriod) }, () => false));
        setAnnualMonths(buildAnnualMonths(y));
        setEditingId(null);
      } else {
        // Navegação normal para período com registro → modo edição
        setEvento(existing.eventName);
        setCargaHoraria(String(existing.totalHours));
        setDias(existing.monthlyDays);
        setAnnualMonths(existing.annualMonths);
        setEditingId(existing.id);
      }
    } else {
      const [y] = referencePeriod.split('-').map(Number);
      setEvento('');
      setCargaHoraria('');
      setDias(Array.from({ length: getDaysInMonth(referencePeriod) }, () => false));
      setAnnualMonths(buildAnnualMonths(y));
      setEditingId(null);
    }
  }, [referencePeriod, tempo, state.records]);

  // ─── Navegação de período ──────────────────────────────────────────────────
  function navigatePeriod(direction: 1 | -1) {
    const [y, m] = referencePeriod.split('-').map(Number);
    const next = new Date(y, m - 1 + direction, 1);
    const newY = next.getFullYear();
    const newM = String(next.getMonth() + 1).padStart(2, '0');
    setReferencePeriod(`${newY}-${newM}`);
  }

  // ─── Dias mensais ──────────────────────────────────────────────────────────
  function toggleDia(index: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDias((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  // ─── Meses anuais ──────────────────────────────────────────────────────────
  function adjustMonth(monthIndex: number, delta: 1 | -1) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnnualMonths((prev) =>
      prev.map((m) =>
        m.monthIndex === monthIndex
          ? {
              ...m,
              completedDays: Math.max(
                0,
                Math.min(m.totalDays, m.completedDays + delta),
              ),
            }
          : m,
      ),
    );
  }

  // ─── Computados ────────────────────────────────────────────────────────────
  const diasMarcados = useMemo(() => dias.filter(Boolean).length, [dias]);
  const percentualDias = useMemo(
    () => (tempo === 'mensal' ? (diasMarcados / daysInMonth) * 100 : 0),
    [diasMarcados, daysInMonth, tempo],
  );
  const totalHours = Number(cargaHoraria) || 0;
  const cargaProgress = useMemo(() => {
    if (tempo === 'mensal') {
      return daysInMonth > 0 ? diasMarcados / daysInMonth : 0;
    }
    const totalDays = annualMonths.reduce((s, m) => s + m.totalDays, 0);
    const doneDays = annualMonths.reduce((s, m) => s + m.completedDays, 0);
    return totalDays > 0 ? doneDays / totalDays : 0;
  }, [tempo, diasMarcados, daysInMonth, annualMonths]);
  const progressLabel = useMemo(() => {
    if (tempo === 'mensal') {
      return `${diasMarcados}/${daysInMonth} dias`;
    }
    const doneDays = annualMonths.reduce((s, m) => s + m.completedDays, 0);
    const totalDays = annualMonths.reduce((s, m) => s + m.totalDays, 0);
    return `${doneDays}/${totalDays} dias`;
  }, [tempo, diasMarcados, daysInMonth, annualMonths]);

  // ─── Handlers de campo ─────────────────────────────────────────────────────
  function handleEventoChange(v: string) {
    setEvento(v);
    setErrors((p) => ({ ...p, eventName: '' }));
  }

  function handleCargaHorariaChange(v: string) {
    setCargaHoraria(v);
    setErrors((p) => ({ ...p, totalHours: '' }));
  }

  // ─── Salvar ────────────────────────────────────────────────────────────────
  async function handleSave() {
    const validation = validateAproveitamento({
      eventName: evento,
      totalHours: cargaHoraria,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<AproveitamentoRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        eventName: evento.trim(),
        totalHours,
        periodType: tempo,
        monthlyDays: dias,
        annualMonths,
        referencePeriod,
      };

      if (editingId) {
        const existing = state.records.find((r) => r.id === editingId);
        if (!existing) return;
        await updateRecord({ ...existing, ...payload });
      } else {
        await addRecord(payload);
        skipNextHydrationRef.current = true;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setErrors({});
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o registro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function populateFormFromRecord(record: AproveitamentoRecord) {
    setEvento(record.eventName);
    setCargaHoraria(String(record.totalHours));
    setTempo(record.periodType);
    setReferencePeriod(record.referencePeriod);
    setDias(record.monthlyDays);
    setAnnualMonths(record.annualMonths);
    setEditingId(record.id);
    setErrors({});
  }

  return {
    // Estado do contexto
    state,
    removeRecord,
    // Formulário
    evento,
    handleEventoChange,
    cargaHoraria,
    handleCargaHorariaChange,
    tempo,
    setTempo,
    referencePeriod,
    dias,
    annualMonths,
    editingId,
    isSubmitting,
    errors,
    // Derivados
    daysInMonth,
    diasMarcados,
    percentualDias,
    totalHours,
    cargaProgress,
    progressLabel,
    // Ações
    navigatePeriod,
    toggleDia,
    adjustMonth,
    handleSave,
    populateFormFromRecord,
  };
}
