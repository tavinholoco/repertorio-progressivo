import { Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { MONTH_NAMES } from '@/utils/dateHelpers';
import type { MonthRecord } from '@/types';

interface MonthGridProps {
  months: MonthRecord[];
  onAdjust: (monthIndex: number, delta: 1 | -1) => void;
}

export function MonthGrid({ months, onAdjust }: MonthGridProps) {
  return (
    <>
      <Text className="text-brand-dark mb-2 font-semibold">Meses do ano</Text>
      <View className="flex-row flex-wrap justify-between mb-4">
        {months.map((month) => {
          const pct =
            month.totalDays > 0
              ? Math.round((month.completedDays / month.totalDays) * 100)
              : 0;
          return (
            <View
              key={month.monthIndex}
              className="w-[30%] bg-white rounded-2xl p-3 m-1 border border-brand-border items-center"
            >
              <Text className="text-brand-dark font-semibold text-sm">
                {MONTH_NAMES[month.monthIndex]}
              </Text>
              <View className="w-full h-2 bg-brand-yellow rounded-full mt-2 overflow-hidden">
                <View
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: AppColors.accent,
                  }}
                />
              </View>
              <Text className="text-xs text-brand-muted mt-1 mb-1">
                {month.completedDays}/{month.totalDays}d
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => onAdjust(month.monthIndex, -1)}
                  className="bg-brand-light rounded-lg px-2 py-1"
                >
                  <Text className="text-brand-primary font-bold">−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onAdjust(month.monthIndex, 1)}
                  className="bg-brand-light rounded-lg px-2 py-1"
                >
                  <Text className="text-brand-primary font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}
