import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { AppColors } from '@/constants/theme';

const PRIORITY_OPTIONS = [
  { color: AppColors.priority.green, icon: 'check-circle' as const },
  { color: AppColors.priority.yellow, icon: 'star' as const },
  { color: AppColors.priority.red, icon: 'warning' as const },
];

interface PriorityPickerProps {
  selectedColor: string | null;
  onSelect: (color: string) => void;
  error?: string;
}

export function PriorityPicker({ selectedColor, onSelect, error }: PriorityPickerProps) {
  return (
    <>
      <Text className="text-brand-dark text-base mb-3 font-medium">Prioridade</Text>
      <View className="flex-row justify-around mb-2">
        {PRIORITY_OPTIONS.map(({ color, icon }) => (
          <TouchableOpacity
            key={color}
            onPress={() => onSelect(color)}
            className={`items-center justify-center w-20 h-20 rounded-2xl shadow-md border-4 ${
              selectedColor === color ? 'border-brand-primary' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
          >
            <MaterialIcons name={icon} size={40} color={AppColors.white} />
          </TouchableOpacity>
        ))}
      </View>
      {error ? (
        <Text className="text-priority-red text-sm mb-4">{error}</Text>
      ) : (
        <View className="mb-4" />
      )}
    </>
  );
}
