import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AppColors, FontFamily } from '@/constants/theme';
import { formatPeriodLabel } from '@/utils/dateHelpers';
import type { AproveitamentoRecord } from '@/types';

interface RecordItemProps {
  record: AproveitamentoRecord;
  index: number;
  onEdit: (r: AproveitamentoRecord) => void;
  onDelete: (id: string) => void;
}

export function RecordItem({ record, index, onEdit, onDelete }: RecordItemProps) {
  const progress = (() => {
    if (record.periodType === 'mensal') {
      const marked = record.monthlyDays.filter(Boolean).length;
      return record.monthlyDays.length > 0 ? marked / record.monthlyDays.length : 0;
    }
    const totalDays = record.annualMonths.reduce((s, m) => s + m.totalDays, 0);
    const doneDays = record.annualMonths.reduce((s, m) => s + m.completedDays, 0);
    return totalDays > 0 ? doneDays / totalDays : 0;
  })();

  const progressLabel = (() => {
    if (record.periodType === 'mensal') {
      const marked = record.monthlyDays.filter(Boolean).length;
      return `${marked}/${record.monthlyDays.length} dias`;
    }
    const doneDays = record.annualMonths.reduce((s, m) => s + m.completedDays, 0);
    const totalDays = record.annualMonths.reduce((s, m) => s + m.totalDays, 0);
    return `${doneDays}/${totalDays} dias`;
  })();

  const typeIcon = record.periodType === 'mensal' ? 'calendar-outline' : 'stats-chart-outline';

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
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      layout={LinearTransition.springify()}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      style={{ elevation: 2 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontFamily: FontFamily.semiBold, fontSize: 16, color: AppColors.dark }}
            numberOfLines={1}
          >
            {record.eventName}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 6 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF3B0',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 3,
                marginRight: 6,
              }}
            >
              <Text style={{ fontFamily: FontFamily.bold, fontSize: 12, color: AppColors.primary }}>
                {formatPeriodLabel(record.referencePeriod)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F5F3FF',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderWidth: 1,
                borderColor: '#EDE9FE',
              }}
            >
              <Ionicons
                name={typeIcon as keyof typeof Ionicons.glyphMap}
                size={11}
                color={AppColors.accent}
                style={{ marginRight: 4 }}
              />
              <Text style={{ fontFamily: FontFamily.medium, fontSize: 12, color: AppColors.muted }}>
                {record.periodType}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => onEdit(record)} style={{ padding: 8, marginRight: 2 }}>
          <MaterialIcons name="edit" size={22} color={AppColors.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
          <MaterialIcons name="delete-outline" size={22} color={AppColors.priority.red} />
        </TouchableOpacity>
      </View>

      {/* Progress bar h-2 com percentual inline */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, height: 8, backgroundColor: '#FFF3B0', borderRadius: 9999, overflow: 'hidden' }}>
          <View
            style={{
              width: `${Math.round(progress * 100)}%`,
              height: '100%',
              backgroundColor: AppColors.accent,
              borderRadius: 9999,
            }}
          />
        </View>
        <Text style={{ fontFamily: FontFamily.semiBold, fontSize: 12, color: AppColors.muted, marginLeft: 10 }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
      <Text style={{ fontFamily: FontFamily.regular, fontSize: 12, color: AppColors.muted, marginTop: 4 }}>
        {progressLabel}
      </Text>
    </Animated.View>
  );
}
