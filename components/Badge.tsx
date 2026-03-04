import { Text, View } from 'react-native';

import { AppColors, FontFamily, Layout } from '@/constants/theme';

interface BadgeProps {
  label: string;
  backgroundColor: string;
  textColor?: string;
}

export function Badge({ label, backgroundColor, textColor = AppColors.primary }: BadgeProps) {
  return (
    <View
      style={{
        backgroundColor,
        borderRadius: Layout.badge.borderRadius,
        paddingHorizontal: Layout.badge.paddingH,
        paddingVertical: Layout.badge.paddingV,
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ fontFamily: FontFamily.semiBold, fontSize: 12, color: textColor }}>
        {label}
      </Text>
    </View>
  );
}
