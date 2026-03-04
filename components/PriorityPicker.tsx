import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { AppColors, FontFamily, Layout } from '@/constants/theme';

const PRIORITY_OPTIONS = [
  { color: AppColors.priority.green, icon: 'check-circle' as const, label: 'Baixa' },
  { color: AppColors.priority.yellow, icon: 'star' as const, label: 'Média' },
  { color: AppColors.priority.red, icon: 'warning' as const, label: 'Alta' },
];

function PriorityButton({
  color,
  icon,
  label,
  isSelected,
  onPress,
}: {
  color: string;
  icon: 'check-circle' | 'star' | 'warning' | 'palette';
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.1 : 1.0, {
      damping: 12,
      stiffness: 180,
    });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={`Prioridade ${label}`}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: Layout.cardRadius,
            backgroundColor: color,
            borderWidth: isSelected ? 3 : 0,
            borderColor: isSelected ? AppColors.white : 'transparent',
            shadowColor: isSelected ? color : 'transparent',
            shadowOpacity: isSelected ? 0.5 : 0,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: isSelected ? 8 : 2,
          }}
        >
          <MaterialIcons name={icon} size={36} color={AppColors.white} />
        </TouchableOpacity>
      </Animated.View>
      <Text
        style={{
          fontFamily: FontFamily.medium,
          fontSize: 11,
          color: isSelected ? AppColors.dark : AppColors.muted,
          marginTop: 6,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface PriorityPickerProps {
  selectedColor: string | null;
  onSelect: (color: string) => void;
  error?: string;
  customColor?: string | null;
  onOpenColorPicker: () => void;
}

export function PriorityPicker({
  selectedColor,
  onSelect,
  error,
  customColor,
  onOpenColorPicker,
}: PriorityPickerProps) {
  return (
    <>
      <Text style={{ fontFamily: FontFamily.medium, fontSize: 16, color: AppColors.dark, marginBottom: 12 }}>
        Prioridade
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Prioridade" style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
        {PRIORITY_OPTIONS.map(({ color, icon, label }) => (
          <PriorityButton
            key={color}
            color={color}
            icon={icon}
            label={label}
            isSelected={selectedColor === color}
            onPress={() => onSelect(color)}
          />
        ))}

        <PriorityButton
          color={customColor ?? AppColors.lightPurple}
          icon="palette"
          label="Custom"
          isSelected={selectedColor === 'custom'}
          onPress={onOpenColorPicker}
        />
      </View>
      {error ? (
        <Text style={{ fontFamily: FontFamily.regular, fontSize: 13, color: AppColors.priority.red, marginBottom: 16 }}>
          {error}
        </Text>
      ) : (
        <View style={{ marginBottom: 16 }} />
      )}
    </>
  );
}
