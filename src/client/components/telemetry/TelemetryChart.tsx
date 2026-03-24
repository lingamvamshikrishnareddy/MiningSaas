'use client';

import LineChart from '@/components/charts/LineChart';

interface TelemetryChartProps {
  data: any[];
  metric: string;
  color?: string;
}

export default function TelemetryChart({ data, metric, color = '#3b82f6' }: TelemetryChartProps) {
  return (
    <LineChart
      data={data}
      xKey="timestamp"
      yKeys={[{ key: metric, color, name: metric }]}
      height={200}
    />
  );
}
