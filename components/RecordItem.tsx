import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AppColors, FontFamily, Layout } from '@/constants/theme';
import { formatPeriodLabel } from '@/utils/dateHelpers';
import type { AproveitamentoRecord } from '@/types';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';

function computeProgress(record: AproveitamentoRecord): { value: number; label: string } {
  if (record.periodType === 'mensal') {
    const marked = record.monthlyDays.filter(Boolean).length;
    const total = record.monthlyDays.length;
    return { value: total > 0 ? marked / total : 0, label: `${marked}/${total} dias` };
  }
  const totalDays = record.annualMonths.reduce((s, m) => s + m.totalDays, 0);
  const doneDays = record.annualMonths.reduce((s, m) => s + m.completedDays, 0);
  return { value: totalDays > 0 ? doneDays / totalDays : 0, label: `${doneDays}/${totalDays} dias` };
}

interface RecordItemProps {
  record: AproveitamentoRecord;
  index: number;
  onEdit: (r: AproveitamentoRecord) => void;
  onDelete: (id: string) => void;
}

export function RecordItem({ record, index, onEdit, onDelete }: RecordItemProps) {
  const { value: progress, label: progressLabel } = computeProgress(record);

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
          <View style={{ flexDirection: 'row', marginTop: 6, gap: 6 }}>
            <Badge
              label={formatPeriodLabel(record.referencePeriod)}
              backgroundColor={AppColors.yellow}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: AppColors.lightAccent,
                borderRadius: Layout.badge.borderRadius,
                paddingHorizontal: Layout.badge.paddingH,
                paddingVertical: Layout.badge.paddingV,
                borderWidth: 1,
                borderColor: AppColors.lightPurple,
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

        <TouchableOpacity onPress={() => onEdit(record)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: 2 }} accessibilityLabel="Editar registro" accessibilityRole="button">
          <MaterialIcons name="edit" size={22} color={AppColors.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Remover registro" accessibilityRole="button">
          <MaterialIcons name="delete-outline" size={22} color={AppColors.priority.red} />
        </TouchableOpacity>
      </View>

      {/* Progress bar com percentual inline */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ProgressBar progress={progress} style={{ flex: 1 }} />
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
