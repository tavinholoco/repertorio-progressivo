import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface DayGridProps {
  days: boolean[];
  onToggle: (index: number) => void;
}

function DayCell({
  index,
  marcado,
  onToggle,
}: {
  index: number;
  marcado: boolean;
  onToggle: (index: number) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    onToggle(index);
  }, [index, onToggle, scale]);

  return (
    <Animated.View style={[{ width: '30%', margin: 4 }, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        className={`rounded-2xl p-4 items-center justify-center ${
          marcado
            ? 'bg-brand-accent'
            : 'bg-white border border-brand-border'
        }`}
      >
        <Text
          className={`font-bold text-base ${
            marcado ? 'text-white' : 'text-brand-dark'
          }`}
        >
          {index + 1}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function DayGrid({ days, onToggle }: DayGridProps) {
  return (
    <>
      <Text className="text-brand-dark mb-2 font-semibold">Dias estudados</Text>
      <View className="flex-row flex-wrap justify-between mb-4">
        {days.map((marcado, index) => (
          <DayCell
            key={index}
            index={index}
            marcado={marcado}
            onToggle={onToggle}
          />
        ))}
      </View>
    </>
  );
}
