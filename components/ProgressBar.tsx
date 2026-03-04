import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { AppColors, Layout } from '@/constants/theme';

interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({ progress, style }: ProgressBarProps) {
  const pw = useSharedValue(0);

  useEffect(() => {
    pw.value = withTiming(progress, { duration: Layout.animation.progress });
  }, [progress, pw]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${pw.value * 100}%`,
    height: '100%',
    backgroundColor: AppColors.accent,
    borderRadius: Layout.infiniteRadius,
  }));

  return (
    <View
      style={[
        {
          width: '100%',
          height: Layout.progressHeight,
          backgroundColor: AppColors.yellow,
          borderRadius: Layout.infiniteRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={fillStyle} />
    </View>
  );
}
