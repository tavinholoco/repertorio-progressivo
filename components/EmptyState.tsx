import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppColors, FontFamily, Layout } from '@/constants/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
    >
    <Animated.View
      entering={FadeIn.duration(Layout.animation.enter)}
      style={styles.container}
    >
      <Animated.View style={styles.iconWrapper}>
        <Ionicons name={icon} size={48} color={AppColors.accent} />
      </Animated.View>

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Layout.screenPadding,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AppColors.lightPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.buttonPaddingV,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: AppColors.dark,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: AppColors.muted,
    textAlign: 'center',
    maxWidth: 260,
  },
});
