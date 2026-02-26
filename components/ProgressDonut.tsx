import { Text, View } from 'react-native';

interface ProgressDonutProps {
  percentage: number;
}

export function ProgressDonut({ percentage }: ProgressDonutProps) {
  return (
    <View
      className="bg-brand-yellow rounded-full items-center justify-center"
      style={{
        width: 130,
        height: 130,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View
        className="bg-white rounded-full items-center justify-center"
        style={{ width: 90, height: 90 }}
      >
        <Text className="text-brand-primary text-2xl font-bold">
          {Math.round(percentage)}%
        </Text>
        <Text className="text-brand-muted text-xs">dos dias</Text>
      </View>
    </View>
  );
}
