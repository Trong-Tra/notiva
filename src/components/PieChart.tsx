import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface Slice {
  value: number;
  color: string;
  label: string;
}

interface PieChartProps {
  data: Slice[];
  size?: number;
  strokeWidth?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function PieChart({ data, size = 140, strokeWidth = 0 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;
  const holeR = r * 0.55;

  let currentAngle = 0;
  const slices = data.map((item) => {
    const sliceAngle = total === 0 ? 0 : (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;
    return { ...item, startAngle, endAngle, path: describeArc(cx, cy, r, startAngle, endAngle) };
  });

  const completionRate = total > 0 ? Math.round((data.find((d) => d.label === 'Done')?.value || 0) / total * 100) : 0;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {slices.map((slice, index) => (
          <Path key={index} d={slice.path} fill={slice.color} />
        ))}
        <Circle cx={cx} cy={cy} r={holeR} fill="#fff" />
      </Svg>
      <View style={styles.centerLabel}>
        <Text style={styles.centerPercent}>{completionRate}%</Text>
        <Text style={styles.centerText}>done</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 140,
    height: 140,
  },
  centerLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPercent: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  centerText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
