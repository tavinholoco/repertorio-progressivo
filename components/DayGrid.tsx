import { Text, TouchableOpacity, View } from 'react-native';

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
            className={`w-[30%] rounded-2xl p-4 m-1 items-center justify-center active:opacity-75 ${
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
        ))}
      </View>
    </>
  );
}
