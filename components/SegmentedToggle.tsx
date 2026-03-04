import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { AppColors, FontFamily, Layout } from '@/constants/theme';
import type { PeriodType } from '@/types';

interface SegmentedToggleProps {
  tempo: PeriodType;
  onSelect: (t: PeriodType) => void;
}

export function SegmentedToggle({ tempo, onSelect }: SegmentedToggleProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const halfWidth = containerWidth / 2;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (halfWidth === 0) return;
    indicatorX.value = withSpring(tempo === 'mensal' ? 0 : halfWidth, { damping: 20 });
  }, [tempo, halfWidth, indicatorX]);

  const pillStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: indicatorX.value,
    width: halfWidth,
    height: '100%',
    backgroundColor: AppColors.accent,
    borderRadius: Layout.cardRadius,
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      accessibilityRole="radiogroup"
      style={{
        flexDirection: 'row',
        backgroundColor: AppColors.white,
        borderRadius: Layout.cardRadius,
        borderWidth: 1,
        borderColor: AppColors.border,
        marginBottom: 20,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Animated.View style={pillStyle} />
      {(['mensal', 'anual'] as PeriodType[]).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onSelect(t)}
          accessibilityRole="radio"
          accessibilityState={{ selected: t === tempo }}
          accessibilityLabel={t.charAt(0).toUpperCase() + t.slice(1)}
          style={{ flex: 1, paddingVertical: Layout.buttonPaddingV, zIndex: 1 }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontFamily: FontFamily.semiBold,
              fontSize: 14,
              color: tempo === t ? AppColors.white : AppColors.dark,
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
