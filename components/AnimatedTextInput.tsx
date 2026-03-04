import { TextInput, type TextInputProps } from 'react-native';

import { AppColors, Layout } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

interface AnimatedTextInputProps extends TextInputProps {
  containerClassName?: string;
}

export function AnimatedTextInput({
  containerClassName,
  onFocus,
  onBlur,
  style,
  ...rest
}: AnimatedTextInputProps) {
  const focus = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focus.value,
      [0, 1],
      [AppColors.border, AppColors.accent],
    );
    return {
      borderWidth: 1,
      borderColor,
      borderRadius: Layout.cardRadius,
      backgroundColor: AppColors.white,
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <TextInput
        onFocus={(e) => {
          focus.value = withTiming(1, { duration: Layout.animation.focus });
          onFocus?.(e);
        }}
        onBlur={(e) => {
          focus.value = withTiming(0, { duration: Layout.animation.focus });
          onBlur?.(e);
        }}
        style={[{ padding: Layout.inputPadding, fontSize: 14, color: AppColors.dark }, style]}
        {...rest}
      />
    </Animated.View>
  );
}
