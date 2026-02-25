import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppColors } from '@/constants/theme';

interface DayGridProps {
  days: boolean[];
  onToggle: (index: number) => void;
}

export function DayGrid({ days, onToggle }: DayGridProps) {
  return (
    <>
      <Text className="text-brand-dark mb-2 font-semibold">Dias estudados</Text>
      <View className="flex-row flex-wrap justify-between mb-4">
        {days.map((marcado, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onToggle(index)}
            className="w-[30%] bg-white rounded-2xl p-4 m-1 border border-brand-border flex-row items-center justify-between"
          >
            <Text className="text-brand-dark font-semibold">{index + 1}</Text>
            <MaterialIcons
              name={marcado ? 'check-box' : 'check-box-outline-blank'}
              size={26}
              color={marcado ? AppColors.accent : AppColors.muted}
            />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
