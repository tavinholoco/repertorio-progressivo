import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AppColors, FontFamily } from '@/constants/theme';
import { resolveColor } from '@/hooks';
import { formatDisplayDate, formatDisplayTime } from '@/utils';
import type { Reminder } from '@/types';

interface ReminderItemProps {
  reminder: Reminder;
  index: number;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
}

export function ReminderItem({ reminder, index, onEdit, onDelete }: ReminderItemProps) {
  const color = resolveColor(reminder);

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
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      layout={LinearTransition.springify()}
      style={{ elevation: 2, flexDirection: 'row', alignItems: 'center' }}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      {/* Faixa lateral refinada */}
      <View
        style={{
          width: 4,
          borderRadius: 4,
          alignSelf: 'stretch',
          marginRight: 12,
          backgroundColor: color,
        }}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{ fontFamily: FontFamily.semiBold, fontSize: 16, color: AppColors.dark }}
          numberOfLines={1}
        >
          {reminder.name}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: AppColors.yellow,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 3,
            alignSelf: 'flex-start',
            marginTop: 6,
          }}
        >
          <Ionicons name="time-outline" size={10} color={AppColors.primary} style={{ marginRight: 4 }} />
          <Text style={{ fontFamily: FontFamily.semiBold, fontSize: 12, color: AppColors.primary }}>
            {formatDisplayDate(reminder.date)} às {formatDisplayTime(reminder.time)}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => onEdit(reminder)} style={{ padding: 8, marginRight: 2 }} accessibilityLabel="Editar lembrete" accessibilityRole="button">
        <MaterialIcons name="edit" size={22} color={AppColors.accent} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }} accessibilityLabel="Remover lembrete" accessibilityRole="button">
        <MaterialIcons name="delete-outline" size={22} color={AppColors.priority.red} />
      </TouchableOpacity>
    </Animated.View>
  );
}
