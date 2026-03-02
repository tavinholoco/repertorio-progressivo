import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppColors, FontFamily } from '@/constants/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={{ alignItems: 'center', paddingVertical: 32 }}
    >
      <Animated.View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: AppColors.lightPurple,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={48} color={AppColors.accent} />
      </Animated.View>

      <Text
        style={{
          fontFamily: FontFamily.bold,
          fontSize: 16,
          color: AppColors.dark,
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={{
            fontFamily: FontFamily.regular,
            fontSize: 14,
            color: AppColors.muted,
            textAlign: 'center',
            maxWidth: 260,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );
}
