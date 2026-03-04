declare module 'react-native-svg' {
  import { ComponentType, ReactNode } from 'react';
  import { ViewStyle } from 'react-native';

  interface CommonProps {
    children?: ReactNode;
    fill?: string;
    fillOpacity?: number | string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeOpacity?: number | string;
    strokeDasharray?: string;
    strokeDashoffset?: number | string;
    strokeLinecap?: 'butt' | 'square' | 'round';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    rotation?: number | string;
    origin?: string;
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    style?: ViewStyle;
  }

  interface SvgProps extends CommonProps {
    viewBox?: string;
    preserveAspectRatio?: string;
  }

  interface CircleProps extends CommonProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
  }

  interface TextProps extends CommonProps {
    textAnchor?: 'start' | 'middle' | 'end';
    fontSize?: number | string;
    fontWeight?: string | number;
    fontFamily?: string;
  }

  const Svg: ComponentType<SvgProps>;
  const Circle: ComponentType<CircleProps>;
  const Text: ComponentType<TextProps>;

  export default Svg;
  export { Svg, Circle, Text };
}
