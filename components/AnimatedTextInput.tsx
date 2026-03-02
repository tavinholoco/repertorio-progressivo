import { TextInput, type TextInputProps } from 'react-native';

import { AppColors } from '@/constants/theme';
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
      borderRadius: 16,
      backgroundColor: AppColors.white,
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <TextInput
        onFocus={(e) => {
          focus.value = withTiming(1, { duration: 200 });
          onFocus?.(e);
        }}
        onBlur={(e) => {
          focus.value = withTiming(0, { duration: 200 });
          onBlur?.(e);
        }}
        style={[{ padding: 16, fontSize: 14, color: AppColors.dark }, style]}
        {...rest}
      />
    </Animated.View>
  );
}
