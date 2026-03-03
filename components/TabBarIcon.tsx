import React from 'react';
import Svg, { Circle } from 'react-native-svg';
// @ts-expect-error — re-exported by react-native-svg but TS bundler resolution misses them
import { Path, Rect, Line } from 'react-native-svg';

type TabBarIconName =
  | 'calendar'
  | 'calendar-outline'
  | 'bar-chart'
  | 'bar-chart-outline';

interface TabBarIconProps {
  name: TabBarIconName;
  color: string;
  size?: number;
}

/** SVG-based tab bar icons — avoids font rendering issues on Fabric. */
export function TabBarIcon({ name, color, size = 24 }: TabBarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      {renderIcon(name, color)}
    </Svg>
  );
}

function renderIcon(name: TabBarIconName, color: string) {
  switch (name) {
    case 'calendar':
      return (
        <>
          <Path
            fill={color}
            d="M480,128a64,64,0,0,0-64-64H400V48.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,368,48V64H144V48.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,112,48V64H96a64,64,0,0,0-64,64v12a4,4,0,0,0,4,4H476a4,4,0,0,0,4-4Z"
          />
          <Path
            fill={color}
            d="M32,416a64,64,0,0,0,64,64H416a64,64,0,0,0,64-64V179a3,3,0,0,0-3-3H35a3,3,0,0,0-3,3ZM376,208a24,24,0,1,1-24,24A24,24,0,0,1,376,208Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,376,288Zm-80-80a24,24,0,1,1-24,24A24,24,0,0,1,296,208Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,296,288Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,296,368Zm-80-80a24,24,0,1,1-24,24A24,24,0,0,1,216,288Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,216,368Zm-80-80a24,24,0,1,1-24,24A24,24,0,0,1,136,288Zm0,80a24,24,0,1,1-24,24A24,24,0,0,1,136,368Z"
          />
        </>
      );

    case 'calendar-outline':
      return (
        <>
          <Rect
            fill="none"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={32}
            x={48}
            y={80}
            width={416}
            height={384}
            rx={48}
          />
          <Circle cx={296} cy={232} r={24} fill={color} />
          <Circle cx={376} cy={232} r={24} fill={color} />
          <Circle cx={296} cy={312} r={24} fill={color} />
          <Circle cx={376} cy={312} r={24} fill={color} />
          <Circle cx={136} cy={312} r={24} fill={color} />
          <Circle cx={216} cy={312} r={24} fill={color} />
          <Circle cx={136} cy={392} r={24} fill={color} />
          <Circle cx={216} cy={392} r={24} fill={color} />
          <Circle cx={296} cy={392} r={24} fill={color} />
          <Line
            fill="none"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={32}
            strokeLinecap="round"
            x1={128}
            y1={48}
            x2={128}
            y2={80}
          />
          <Line
            fill="none"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={32}
            strokeLinecap="round"
            x1={384}
            y1={48}
            x2={384}
            y2={80}
          />
          <Line
            fill="none"
            stroke={color}
            strokeLinejoin="round"
            strokeWidth={32}
            x1={464}
            y1={160}
            x2={48}
            y2={160}
          />
        </>
      );

    case 'bar-chart':
      return (
        <>
          <Path
            fill={color}
            d="M480,496H48a32,32,0,0,1-32-32V32a16,16,0,0,1,32,0V464H480a16,16,0,0,1,0,32Z"
          />
          <Path
            fill={color}
            d="M156,432H116a36,36,0,0,1-36-36V244a36,36,0,0,1,36-36h40a36,36,0,0,1,36,36V396A36,36,0,0,1,156,432Z"
          />
          <Path
            fill={color}
            d="M300,432H260a36,36,0,0,1-36-36V196a36,36,0,0,1,36-36h40a36,36,0,0,1,36,36V396A36,36,0,0,1,300,432Z"
          />
          <Path
            fill={color}
            d="M443.64,432h-40a36,36,0,0,1-36-36V132a36,36,0,0,1,36-36h40a36,36,0,0,1,36,36V396A36,36,0,0,1,443.64,432Z"
          />
        </>
      );

    case 'bar-chart-outline':
      return (
        <>
          <Path
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={32}
            d="M32,32V464a16,16,0,0,0,16,16H480"
          />
          <Rect
            x={96}
            y={224}
            width={80}
            height={192}
            rx={20}
            ry={20}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={32}
          />
          <Rect
            x={240}
            y={176}
            width={80}
            height={240}
            rx={20}
            ry={20}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={32}
          />
          <Rect
            x={383.64}
            y={112}
            width={80}
            height={304}
            rx={20}
            ry={20}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={32}
          />
        </>
      );
  }
}
