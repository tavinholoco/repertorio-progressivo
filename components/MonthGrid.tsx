import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppColors, FontFamily, Layout } from '@/constants/theme';
import { MONTH_NAMES } from '@/utils/dateHelpers';
import type { MonthRecord } from '@/types';

interface MonthGridProps {
  months: MonthRecord[];
  onAdjust: (monthIndex: number, delta: 1 | -1) => void;
}

export function MonthGrid({ months, onAdjust }: MonthGridProps) {
  return (
    <>
      <Text style={{ fontFamily: FontFamily.semiBold, fontSize: 14, color: AppColors.dark, marginBottom: 8 }}>
        Meses do ano
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
        {months.map((month) => {
          const pct =
            month.totalDays > 0
              ? Math.round((month.completedDays / month.totalDays) * 100)
              : 0;
          const isComplete = pct === 100;
          const isStarted = pct > 0;

          return (
            <View
              key={month.monthIndex}
              style={{
                width: '30%',
                borderRadius: 16,
                padding: 12,
                margin: 4,
                alignItems: 'center',
                backgroundColor: isComplete ? AppColors.lightGreen : AppColors.white,
                borderWidth: 1,
                borderColor: isComplete ? AppColors.priority.green : isStarted ? AppColors.lightPurple : AppColors.border,
                elevation: isStarted ? 3 : 1,
              }}
            >
              {/* Badge checkmark para 100% */}
              {isComplete && (
                <View style={{ position: 'absolute', top: 6, right: 6 }}>
                  <Ionicons name="checkmark-circle" size={16} color={AppColors.priority.green} />
                </View>
              )}

              <Text
                style={{
                  fontFamily: FontFamily.semiBold,
                  fontSize: 13,
                  color: isComplete ? AppColors.priority.green : isStarted ? AppColors.accent : AppColors.muted,
                }}
              >
                {MONTH_NAMES[month.monthIndex]}
              </Text>
              <View
                accessibilityRole="progressbar"
                accessibilityValue={{ now: pct, min: 0, max: 100 }}
                accessibilityLabel={`Progresso de ${MONTH_NAMES[month.monthIndex]}: ${pct}%`}
                style={{
                  width: '100%',
                  height: 6, // intencionalmente menor que progressHeight para o card compacto
                  backgroundColor: AppColors.yellow,
                  borderRadius: Layout.infiniteRadius,
                  marginTop: 8,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: isComplete ? AppColors.priority.green : AppColors.accent,
                    borderRadius: Layout.infiniteRadius,
                  }}
                />
              </View>
              <Text style={{ fontFamily: FontFamily.regular, fontSize: 11, color: AppColors.muted, marginTop: 4, marginBottom: 8 }}>
                {month.completedDays}/{month.totalDays} dias
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => onAdjust(month.monthIndex, -1)}
                  accessibilityLabel={`Diminuir dias de ${MONTH_NAMES[month.monthIndex]}`}
                  accessibilityRole="button"
                  style={{
                    backgroundColor: AppColors.lightAccent,
                    borderWidth: 1,
                    borderColor: AppColors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FontFamily.bold, color: AppColors.primary }}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onAdjust(month.monthIndex, 1)}
                  accessibilityLabel={`Aumentar dias de ${MONTH_NAMES[month.monthIndex]}`}
                  accessibilityRole="button"
                  style={{
                    backgroundColor: AppColors.accent,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    minHeight: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FontFamily.bold, color: AppColors.white }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}
