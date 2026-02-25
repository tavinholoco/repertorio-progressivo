import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Calendar } from 'react-native-calendars';

import { useReminders } from '@/context/RemindersContext';
import { AppColors, calendarTheme } from '@/constants/theme';
import type { Priority, Reminder } from '@/types';
import { validateReminder } from '@/utils/validation';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<Priority, string> = {
  green: AppColors.priority.green,
  yellow: AppColors.priority.yellow,
  red: AppColors.priority.red,
};

const COLOR_TO_PRIORITY: Record<string, Priority> = {
  [AppColors.priority.green]: 'green',
  [AppColors.priority.yellow]: 'yellow',
  [AppColors.priority.red]: 'red',
};

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

function formatDisplayDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function formatDisplayTime(hhmm: string): string {
  return hhmm;
}

// ─── Componente de item da lista ──────────────────────────────────────────────

interface ReminderItemProps {
  reminder: Reminder;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
}

function ReminderItem({ reminder, onEdit, onDelete }: ReminderItemProps) {
  const color = PRIORITY_COLORS[reminder.priority];

  function handleDelete() {
    Alert.alert(
      'Remover lembrete',
      `Deseja remover "${reminder.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onDelete(reminder.id),
        },
      ],
    );
  }

  return (
    <View
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 border border-[#E0E0E0]"
    >
      <View className="flex-1">
        <Text className="text-[#1E1E1E] font-semibold text-base" numberOfLines={1}>
          {reminder.name}
        </Text>
        <Text className="text-[#5C5C5C] text-sm mt-1">
          {formatDisplayDate(reminder.date)} às {formatDisplayTime(reminder.time)}
        </Text>
      </View>

      <TouchableOpacity onPress={() => onEdit(reminder)} className="p-2 mr-1">
        <MaterialIcons name="edit" size={22} color="#6C2DC7" />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} className="p-2">
        <MaterialIcons name="delete-outline" size={22} color="#E11D48" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function AgendaScreen() {
  const { state, addReminder, updateReminder, removeReminder } = useReminders();

  // Formulário
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estado de edição e submissão
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── markedDates dinâmico ────────────────────────────────────────────────────
  const markedDates = useMemo(() => {
    return state.reminders.reduce<
      Record<string, { selected: boolean; selectedColor: string }>
    >((acc, r) => {
      acc[r.date] = {
        selected: true,
        selectedColor: PRIORITY_COLORS[r.priority],
      };
      return acc;
    }, {});
  }, [state.reminders]);

  // ─── Handlers do formulário ──────────────────────────────────────────────────

  function handleSelectColor(color: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedColor(color);
    setErrors((prev) => ({ ...prev, priority: '' }));
  }

  function populateForm(reminder: Reminder) {
    setName(reminder.name);
    setSelectedColor(PRIORITY_COLORS[reminder.priority]);

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
    setDate(new Date());
    setTime(new Date());
    setEditingReminder(null);
    setErrors({});
  }

  async function handleSave() {
    const validation = validateReminder({
      name,
      date: toDateString(date),
      time: toTimeString(time),
      priority: selectedColor ? COLOR_TO_PRIORITY[selectedColor] ?? null : null,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const priority = COLOR_TO_PRIORITY[selectedColor!];

      if (editingReminder) {
        await updateReminder({
          ...editingReminder,
          name: name.trim(),
          date: toDateString(date),
          time: toTimeString(time),
          priority,
        });
      } else {
        await addReminder({
          name: name.trim(),
          date: toDateString(date),
          time: toTimeString(time),
          priority,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetForm();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o lembrete. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <FlatList
      className="flex-1 bg-[#F7F6FB]"
      contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 160 }}
      ListHeaderComponent={
        <>
          <Text className="text-3xl font-extrabold text-[#3A0CA3] mb-6 text-center">
            Agenda de Lembretes
          </Text>

          {/* ── Nome ── */}
          <View className="mb-5">
            <Text className="text-[#1E1E1E] text-base mb-2 font-medium">Nome do lembrete</Text>
            <TextInput
              value={name}
              onChangeText={(v) => {
                setName(v);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Ex: Reunião de projeto"
              placeholderTextColor="#5C5C5C"
              className="bg-white p-4 rounded-2xl border border-[#E0E0E0] text-[#1E1E1E]"
            />
            {errors.name ? (
              <Text className="text-[#E11D48] text-sm mt-1">{errors.name}</Text>
            ) : null}
          </View>

          {/* ── Data ── */}
          <View className="mb-5">
            <Text className="text-[#1E1E1E] text-base mb-2 font-medium">Data do lembrete</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white p-4 rounded-2xl border border-[#E0E0E0] active:opacity-90"
            >
              <Text className="text-[#1E1E1E]">{date.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selected) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selected) setDate(selected);
                }}
              />
            )}
          </View>

          {/* ── Horário ── */}
          <View className="mb-5">
            <Text className="text-[#1E1E1E] text-base mb-2 font-medium">Horário</Text>
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="bg-white p-4 rounded-2xl border border-[#E0E0E0] active:opacity-90"
            >
              <Text className="text-[#1E1E1E]">
                {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selected) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (selected) setTime(selected);
                }}
              />
            )}
          </View>

          {/* ── Prioridade ── */}
          <Text className="text-[#1E1E1E] text-base mb-3 font-medium">Prioridade</Text>
          <View className="flex-row justify-around mb-2">
            {(['#4ADE80', '#F5C518', '#E11D48'] as const).map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => handleSelectColor(color)}
                className={`items-center justify-center w-20 h-20 rounded-2xl shadow-md border-4 ${
                  selectedColor === color ? 'border-[#3A0CA3]' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              >
                <MaterialIcons
                  name={
                    color === '#4ADE80'
                      ? 'check-circle'
                      : color === '#F5C518'
                      ? 'star'
                      : 'warning'
                  }
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>
            ))}
          </View>
          {errors.priority ? (
            <Text className="text-[#E11D48] text-sm mb-4">{errors.priority}</Text>
          ) : (
            <View className="mb-4" />
          )}

          {/* ── Botão salvar ── */}
          <TouchableOpacity
            className="bg-[#6C2DC7] py-4 rounded-2xl shadow-md mb-2 active:opacity-90"
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                {editingReminder ? 'Atualizar Lembrete' : 'Confirmar Lembrete'}
              </Text>
            )}
          </TouchableOpacity>

          {editingReminder && (
            <TouchableOpacity
              onPress={resetForm}
              className="py-3 rounded-2xl mb-6 border border-[#E0E0E0] active:opacity-90"
            >
              <Text className="text-[#5C5C5C] text-center font-medium">Cancelar edição</Text>
            </TouchableOpacity>
          )}

          {/* ── Calendário ── */}
          <Calendar
            current={new Date().toISOString().split('T')[0]}
            markedDates={markedDates}
            theme={calendarTheme}
          />

          {/* ── Título da lista ── */}
          {state.reminders.length > 0 && (
            <Text className="text-[#1E1E1E] text-lg font-bold mt-6 mb-3">
              Lembretes salvos
            </Text>
          )}

          {state.isLoading && (
            <ActivityIndicator size="large" color="#6C2DC7" className="mt-6" />
          )}
        </>
      }
      data={state.reminders}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ReminderItem
          reminder={item}
          onEdit={populateForm}
          onDelete={removeReminder}
        />
      )}
      ListEmptyComponent={
        !state.isLoading ? (
          <Text className="text-[#5C5C5C] text-center mt-4">
            Nenhum lembrete criado ainda.
          </Text>
        ) : null
      }
    />
  );
}
