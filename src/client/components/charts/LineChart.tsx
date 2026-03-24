'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys?: { key: string; color: string; name: string }[];
  yKey?: string;
  color?: string;
  height?: number;
  title?: string;
}

export default function LineChart({ data, xKey, yKeys, yKey, color = '#3b82f6', height = 300, title }: LineChartProps) {
  const keys = yKey ? [{ key: yKey, color, name: yKey }] : yKeys || [];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey={xKey} 
          stroke="#6b7280" 
          fontSize={12}
          tickFormatter={(value) => value}
        />
        <YAxis stroke="#6b7280" fontSize={12} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        {keys.map((yKey) => (
          <Line
            key={yKey.key}
            type="monotone"
            dataKey={yKey.key}
            stroke={yKey.color}
            name={yKey.name}
            strokeWidth={2}
            dot={{ fill: yKey.color, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
      </>
    </ResponsiveContainer>
  );
}

export { LineChart };
