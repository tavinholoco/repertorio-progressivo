import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppColors, FontFamily } from '@/constants/theme';
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
                backgroundColor: isComplete ? '#F0FFF4' : '#fff',
                borderWidth: 1,
                borderColor: isComplete ? '#4ADE80' : isStarted ? '#EDE9FE' : AppColors.border,
                elevation: isStarted ? 3 : 1,
              }}
            >
              {/* Badge checkmark para 100% */}
              {isComplete && (
                <View style={{ position: 'absolute', top: 6, right: 6 }}>
                  <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
                </View>
              )}

              <Text
                style={{
                  fontFamily: FontFamily.semiBold,
                  fontSize: 13,
                  color: isComplete ? '#4ADE80' : isStarted ? AppColors.accent : AppColors.muted,
                }}
              >
                {MONTH_NAMES[month.monthIndex]}
              </Text>
              <View
                style={{
                  width: '100%',
                  height: 6,
                  backgroundColor: '#FFF3B0',
                  borderRadius: 9999,
                  marginTop: 8,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: isComplete ? '#4ADE80' : AppColors.accent,
                    borderRadius: 9999,
                  }}
                />
              </View>
              <Text style={{ fontFamily: FontFamily.regular, fontSize: 11, color: AppColors.muted, marginTop: 4, marginBottom: 8 }}>
                {month.completedDays}/{month.totalDays} dias
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => onAdjust(month.monthIndex, -1)}
                  style={{
                    backgroundColor: '#F5F3FF',
                    borderWidth: 1,
                    borderColor: AppColors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontFamily: FontFamily.bold, color: AppColors.primary }}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onAdjust(month.monthIndex, 1)}
                  style={{
                    backgroundColor: AppColors.accent,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontFamily: FontFamily.bold, color: '#fff' }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}
