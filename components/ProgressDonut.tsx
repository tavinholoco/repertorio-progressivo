import { Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';

interface ProgressDonutProps {
  percentage: number;
}

export function ProgressDonut({ percentage }: ProgressDonutProps) {
  return (
    <View
      style={{
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: AppColors.yellow,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
      }}
    >
      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: AppColors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: AppColors.primary, fontSize: 22, fontWeight: '700' }}>
          {Math.round(percentage)}%
        </Text>
        <Text style={{ color: AppColors.muted, fontSize: 12 }}>dos dias</Text>
      </View>
    </View>
  );
}
