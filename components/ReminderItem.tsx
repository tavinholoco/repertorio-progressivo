import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppColors } from '@/constants/theme';
import { PRIORITY_COLORS } from '@/hooks/useAgendaForm';
import { formatDisplayDate, formatDisplayTime } from '@/utils/dateHelpers';
import type { Reminder } from '@/types';

interface ReminderItemProps {
  reminder: Reminder;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
}

export function ReminderItem({ reminder, onEdit, onDelete }: ReminderItemProps) {
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
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 border border-brand-border"
    >
      <View className="flex-1">
        <Text className="text-brand-dark font-semibold text-base" numberOfLines={1}>
          {reminder.name}
        </Text>
        <Text className="text-brand-muted text-sm mt-1">
          {formatDisplayDate(reminder.date)} às {formatDisplayTime(reminder.time)}
        </Text>
      </View>

      <TouchableOpacity onPress={() => onEdit(reminder)} className="p-2 mr-1">
        <MaterialIcons name="edit" size={22} color={AppColors.accent} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} className="p-2">
        <MaterialIcons name="delete-outline" size={22} color={AppColors.priority.red} />
      </TouchableOpacity>
    </View>
  );
}
