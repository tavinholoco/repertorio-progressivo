import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppColors } from '@/constants/theme';
import { formatPeriodLabel } from '@/utils/dateHelpers';
import type { AproveitamentoRecord } from '@/types';

interface RecordItemProps {
  record: AproveitamentoRecord;
  onEdit: (r: AproveitamentoRecord) => void;
  onDelete: (id: string) => void;
}

export function RecordItem({ record, onEdit, onDelete }: RecordItemProps) {
  const progress =
    record.totalHours > 0
      ? Math.min(record.completedHours / record.totalHours, 1)
      : 0;

  function handleDelete() {
    Alert.alert(
      'Remover registro',
      `Deseja remover "${record.eventName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => onDelete(record.id),
        },
      ],
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-brand-border">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-brand-dark font-semibold text-base" numberOfLines={1}>
            {record.eventName}
          </Text>
          <Text className="text-brand-muted text-sm">
            {formatPeriodLabel(record.referencePeriod)} · {record.periodType}
          </Text>
        </View>

        <TouchableOpacity onPress={() => onEdit(record)} className="p-2 mr-1">
          <MaterialIcons name="edit" size={22} color={AppColors.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} className="p-2">
          <MaterialIcons name="delete-outline" size={22} color={AppColors.priority.red} />
        </TouchableOpacity>
      </View>

      <View className="w-full h-3 bg-brand-yellow rounded-full overflow-hidden">
        <View
          style={{ width: `${Math.round(progress * 100)}%`, height: '100%', backgroundColor: AppColors.accent }}
        />
      </View>
      <Text className="text-sm text-brand-muted mt-1">
        {Math.round(progress * 100)}% ({record.completedHours}/{record.totalHours} h)
      </Text>
    </View>
  );
}
