import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useReminders } from '@/context/RemindersContext';
import { AppColors } from '@/constants/theme';
import type { Priority, Reminder } from '@/types';
import { validateReminder } from '@/utils/validation';
import { toDateString, toTimeString } from '@/utils/dateHelpers';

// ─── Mapas de cor ↔ prioridade ───────────────────────────────────────────────

export const PRIORITY_COLORS: Record<Priority, string> = {
  green: AppColors.priority.green,
  yellow: AppColors.priority.yellow,
  red: AppColors.priority.red,
  custom: AppColors.fallbackGray,
};

export const COLOR_TO_PRIORITY: Record<string, Priority> = {
  [AppColors.priority.green]: 'green',
  [AppColors.priority.yellow]: 'yellow',
  [AppColors.priority.red]: 'red',
};

/** Retorna o hex correto para qualquer Reminder, incluindo prioridade customizada. */
export function resolveColor(reminder: Pick<Reminder, 'priority' | 'customColor'>): string {
  if (reminder.priority === 'custom') return reminder.customColor ?? AppColors.fallbackGray;
  return PRIORITY_COLORS[reminder.priority];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAgendaForm() {
  const { state, addReminder, updateReminder, removeReminder } = useReminders();

  // Formulário
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Cor personalizada
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [showColorModal, setShowColorModal] = useState(false);

  // Estado de edição e submissão
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── markedDates dinâmico ──────────────────────────────────────────────────
  const markedDates = useMemo(() => {
    return state.reminders.reduce<
      Record<string, { selected: boolean; selectedColor: string }>
    >((acc, r) => {
      acc[r.date] = {
        selected: true,
        selectedColor: resolveColor(r),
      };
      return acc;
    }, {});
  }, [state.reminders]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleSelectColor(color: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColor(color);
    setErrors((prev) => ({ ...prev, priority: '' }));
  }

  function handleNameChange(v: string) {
    setName(v);
    setErrors((prev) => ({ ...prev, name: '' }));
  }

  function populateForm(reminder: Reminder) {
    setName(reminder.name);

    if (reminder.priority === 'custom') {
      setSelectedColor('custom');
      setCustomColor(reminder.customColor ?? null);
    } else {
      setSelectedColor(PRIORITY_COLORS[reminder.priority]);
      setCustomColor(null);
    }

    const [y, m, d] = reminder.date.split('-').map(Number);
    const [h, min] = reminder.time.split(':').map(Number);
    setDate(new Date(y, m - 1, d));
    setTime(new Date(0, 0, 0, h, min));
    setEditingReminder(reminder);
    setErrors({});
  }

  function resetForm() {
    setName('');
    setSelectedColor(null);
    setCustomColor(null);
    setDate(new Date());
    setTime(new Date());
    setEditingReminder(null);
    setErrors({});
  }

  async function handleSave() {
    const isCustom = selectedColor === 'custom';
    const priority: Priority | null = isCustom
      ? 'custom'
      : selectedColor
        ? (COLOR_TO_PRIORITY[selectedColor] ?? null)
        : null;

    const validation = validateReminder({
      name,
      date: toDateString(date),
      time: toTimeString(time),
      priority,
      customColor: isCustom ? customColor : undefined,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const reminderPatch = {
        name: name.trim(),
        date: toDateString(date),
        time: toTimeString(time),
        priority: priority as Priority,
        ...(isCustom ? { customColor: customColor! } : { customColor: undefined }),
      };

      if (editingReminder) {
        await updateReminder({ ...editingReminder, ...reminderPatch });
      } else {
        await addReminder(reminderPatch);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o lembrete. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    // Estado do contexto
    state,
    removeReminder,
    // Formulário
    name,
    handleNameChange,
    selectedColor,
    date,
    setDate,
    time,
    setTime,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    editingReminder,
    isSubmitting,
    errors,
    setErrors,
    // Cor personalizada
    customColor,
    setCustomColor,
    showColorModal,
    setShowColorModal,
    // Derivados
    markedDates,
    // Ações
    handleSelectColor,
    populateForm,
    resetForm,
    handleSave,
  };
}
