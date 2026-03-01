import { TextInput, type TextInputProps } from 'react-native';
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
      ['#E0E0E0', '#6C2DC7'],
    );
    return {
      borderWidth: 1,
      borderColor,
      borderRadius: 16,
      backgroundColor: '#fff',
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
        style={[{ padding: 16, fontSize: 14, color: '#1E1E1E' }, style]}
        {...rest}
      />
    </Animated.View>
  );
}
