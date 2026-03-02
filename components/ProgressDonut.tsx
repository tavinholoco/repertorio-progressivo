import { View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { AppColors, FontFamily } from '@/constants/theme';

interface ProgressDonutProps {
  percentage: number;
}

const SIZE = 140;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function arcColor(pct: number): string {
  if (pct < 40) return AppColors.priority.green;
  if (pct < 70) return AppColors.priority.yellow;
  return AppColors.accent;
}

export function ProgressDonut({ percentage }: ProgressDonutProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
  const strokeDash = (clamped / 100) * CIRCUMFERENCE;
  const center = SIZE / 2;

  return (
    <View accessible accessibilityLabel={`Progresso: ${clamped}% dos dias`} accessibilityRole="image">
    <Svg width={SIZE} height={SIZE}>
      {/* Trilha de fundo */}
      <Circle
        cx={center}
        cy={center}
        r={RADIUS}
        stroke={AppColors.yellow}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
      />
      {/* Arco de progresso */}
      <Circle
        cx={center}
        cy={center}
        r={RADIUS}
        stroke={arcColor(clamped)}
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
        strokeDasharray={`${strokeDash} ${CIRCUMFERENCE}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${center}, ${center}`}
      />
      {/* Percentual */}
      <SvgText
        x={center}
        y={center - 6}
        textAnchor="middle"
        fontSize="24"
        fontWeight="700"
        fontFamily={FontFamily.bold}
        fill={AppColors.primary}
      >
        {clamped}%
      </SvgText>
      {/* Label */}
      <SvgText
        x={center}
        y={center + 14}
        textAnchor="middle"
        fontSize="11"
        fontFamily={FontFamily.regular}
        fill={AppColors.muted}
      >
        dos dias
      </SvgText>
    </Svg>
    </View>
  );
}
